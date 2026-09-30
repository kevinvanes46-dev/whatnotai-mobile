/* Dormant v170A contract: no network, storage, account or production integration. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RareWorthCloudSync = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PREFIX = 'rareworth-json-v1:';
  const MAX_REVISION = 9223372036854775807n;
  const STATES = Object.freeze({EMPTY:'EMPTY', LOCAL_ONLY:'LOCAL_ONLY', CLOUD_ONLY:'CLOUD_ONLY',
    IN_SYNC:'IN_SYNC', LOCAL_NEWER:'LOCAL_NEWER', CLOUD_NEWER:'CLOUD_NEWER', CONFLICT:'CONFLICT'});

  // Exact canonical signature, not a lossy short hash. Array order and Unicode stay intact.
  // Reject non-JSON values instead of silently dropping future collection fields.
  function canonicalJSON(value) {
    const ancestors = new Set();
    function encode(item) {
      if (item === null || typeof item === 'string' || typeof item === 'boolean') return JSON.stringify(item);
      if (typeof item === 'number' && Number.isFinite(item)) return JSON.stringify(item);
      if (typeof item !== 'object' || item === null) throw new TypeError('Expected JSON data');
      if (ancestors.has(item)) throw new TypeError('Cyclic JSON data');
      const array = Array.isArray(item), proto = Object.getPrototypeOf(item);
      if (!array && proto !== Object.prototype && proto !== null) throw new TypeError('Expected plain JSON object');
      if (Object.getOwnPropertySymbols(item).length) throw new TypeError('Symbol fields are not JSON');
      const descriptors = Object.getOwnPropertyDescriptors(item);
      for (const key of Object.keys(descriptors)) {
        if (array && key === 'length') continue;
        if (!descriptors[key].enumerable || !Object.hasOwn(descriptors[key], 'value')) throw new TypeError('Expected JSON value fields');
      }
      ancestors.add(item);
      let result;
      if (array) {
        if (Object.keys(item).length !== item.length) throw new TypeError('Sparse or extended arrays are not JSON');
        const values = [];
        for (let i = 0; i < item.length; i++) {
          if (!Object.hasOwn(item, i)) throw new TypeError('Sparse arrays are not JSON');
          values.push(encode(item[i]));
        }
        result = '[' + values.join(',') + ']';
      } else {
        result = '{' + Object.keys(item).sort().map(key => JSON.stringify(key) + ':' + encode(item[key])).join(',') + '}';
      }
      ancestors.delete(item);
      return result;
    }
    return encode(value);
  }
  const clone = value => JSON.parse(canonicalJSON(value));
  function revision(value) {
    if (typeof value === 'number') {
      if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('Revision must be a safe integer or decimal string');
      value = String(value);
    }
    if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) > MAX_REVISION) {
      throw new TypeError('Invalid bigint revision');
    }
    return value;
  }
  function schema(value) {
    if (typeof value !== 'string' || !value.length) throw new TypeError('Invalid schema_version');
    return value;
  }
  function device(value) {
    if (value !== null && typeof value !== 'string') throw new TypeError('Invalid device_id');
    return value;
  }
  function timestamp(value) {
    if (value === null) return null;
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT.+(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) {
      throw new TypeError('Expected timestamp with timezone');
    }
    return value; // Metadata only: never use clock ordering to resolve conflicts.
  }
  function signature(payload, schemaVersion) {
    return PREFIX + canonicalJSON({payload, schema_version: schemaVersion});
  }
  function base(value) {
    if (value === null) return null;
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new TypeError('Invalid sync base');
    const rev = revision(value.revision);
    if (rev === '0' && value.signature === null) return {revision:rev, signature:null};
    if (rev === '0' || typeof value.signature !== 'string' || !value.signature.startsWith(PREFIX)) throw new TypeError('Invalid sync base signature');
    const content = JSON.parse(value.signature.slice(PREFIX.length));
    if (!Array.isArray(content.payload) || signature(content.payload, schema(content.schema_version)) !== value.signature) throw new TypeError('Invalid sync base signature');
    return {revision:rev, signature:value.signature};
  }
  function parseSnapshot(raw) {
    if (raw === null || raw === undefined) return null;
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (value === null) return null;
    if (Array.isArray(value)) return createLocalSnapshot(value);
    if (!value || typeof value !== 'object' || !Array.isArray(value.payload)) throw new TypeError('Snapshot payload must be an array');
    const result = {
      payload:clone(value.payload),
      revision:revision(value.revision ?? '0'),
      schema_version:schema(value.schema_version ?? 'v133'),
      device_id:device(value.device_id ?? null),
      created_at:timestamp(value.created_at ?? null),
      updated_at:timestamp(value.updated_at ?? null),
      base:base(value.base ?? null)
    };
    // A supplied signature is never trusted: always derive it from actual content.
    result.signature = signature(result.payload, result.schema_version);
    return result;
  }
  function createLocalSnapshot(collectionArray, metadata = {}) {
    if (!Array.isArray(collectionArray)) throw new TypeError('Collection must be an array');
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new TypeError('Invalid metadata');
    return parseSnapshot({payload:collectionArray, revision:metadata.revision ?? '0',
      schema_version:metadata.schema_version ?? 'v133', device_id:metadata.device_id ?? null,
      created_at:metadata.created_at ?? null, updated_at:metadata.updated_at ?? null, base:metadata.base ?? null});
  }
  function cloudSnapshot(raw) {
    const result = parseSnapshot(raw);
    if (result && result.revision === '0') throw new TypeError('Cloud snapshot requires positive revision');
    return result;
  }
  function classifySyncState(localSnapshot, remoteSnapshot) {
    const local = parseSnapshot(localSnapshot), cloud = cloudSnapshot(remoteSnapshot);
    if (!local && !cloud) return STATES.EMPTY;
    if (!cloud) {
      // A vanished previously synced row is not permission to recreate/overwrite it.
      if (local.revision !== '0' || (local.base && local.base.revision !== '0')) return STATES.CONFLICT;
      return local.payload.length ? STATES.LOCAL_ONLY : STATES.EMPTY;
    }
    if (!local) return cloud.payload.length ? STATES.CLOUD_ONLY : STATES.EMPTY;
    if (local.signature === cloud.signature) return local.payload.length ? STATES.IN_SYNC : STATES.EMPTY;
    const known = local.base;
    if (!known || known.revision === '0' || BigInt(cloud.revision) < BigInt(known.revision)) return STATES.CONFLICT;
    const localChanged = local.signature !== known.signature;
    const cloudChanged = cloud.signature !== known.signature;
    // Content cannot change under the same server revision in this protocol.
    if (cloudChanged && cloud.revision === known.revision) return STATES.CONFLICT;
    if (localChanged && cloudChanged) return STATES.CONFLICT;
    if (localChanged) return STATES.LOCAL_NEWER;
    if (cloudChanged) return STATES.CLOUD_NEWER;
    return STATES.CONFLICT;
  }
  function prepareUpload(localSnapshot, cloudRevision) {
    const local = parseSnapshot(localSnapshot), expected = revision(cloudRevision);
    if (!local) throw new TypeError('Upload requires a local snapshot');
    // Revision alone cannot establish a baseline for previously unrelated content.
    if ((local.base && local.base.revision !== expected) || (!local.base && (expected !== '0' || local.revision !== '0'))) {
      return {status:STATES.CONFLICT};
    }
    if (expected === String(MAX_REVISION)) throw new RangeError('Revision exhausted');
    return {status:'READY', rpc:'rareworth_save_collection_snapshot', args:{
      expected_revision:expected, new_payload:clone(local.payload),
      new_schema_version:local.schema_version, new_device_id:local.device_id
    }};
  }
  function prepareDownload(remoteSnapshot) {
    const cloud = cloudSnapshot(remoteSnapshot);
    if (!cloud) throw new TypeError('Download requires a cloud snapshot');
    // This is a detached proposal, never an instruction to replace local storage.
    return {status:'READY', collection:clone(cloud.payload), metadata:{
      revision:cloud.revision, schema_version:cloud.schema_version, device_id:cloud.device_id,
      created_at:cloud.created_at, updated_at:cloud.updated_at,
      base:{revision:cloud.revision, signature:cloud.signature}
    }};
  }
  return Object.freeze({STATES, canonicalJSON, parseSnapshot, createLocalSnapshot,
    classifySyncState, prepareUpload, prepareDownload});
});
