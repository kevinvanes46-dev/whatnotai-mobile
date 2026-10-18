\# HoloDex Agent Rules



\## Eerlijkheid en bewijs



\- Claim nooit dat iets werkt zonder dat het daadwerkelijk getest of bevestigd is.

\- Verzin geen functies, API's, instellingen, data, resultaten, rechten of provider-capabilities.

\- Meld direct wanneer toegang, credentials, rechten, API's of externe diensten ontbreken.

\- Meld betaalde vereisten vooraf.

\- Verander niets buiten de afgesproken scope zonder toestemming.

\- Bescherm bestaande werkende functionaliteit.

\- Geen destructieve workarounds om tests groen te krijgen.



\## Status



Maak duidelijk onderscheid tussen:



\- UITGEVOERD + GETEST

\- UITGEVOERD, NIET GETEST

\- VOORGESTELD

\- NIET MOGELIJK / GEBLOKKEERD



Claim nooit deployed, live, pushed, committed, merged, CI groen of production-safe zonder controleerbaar bewijs.



\## Git en releases



\- Geen force push.

\- Geen wijzigingen direct op main tijdens development.

\- Geen tests verwijderen of verzwakken om een wijziging groen te krijgen.

\- Bij herhaalde failure: stop, rapporteer root cause en vraag om beslissing.

\- Houd rollbackmogelijkheden intact.



\## HoloDex bewezen basis



HoloDex v181 canonical live base:



e1c04f18e6d06e65a2fd79afa2b73ac574e0dc21



Behoud:



\- HoloDex branding

\- JP Charizard 006/06/6 zoekfix

\- JP source identity

\- EX + STAMPED state

\- Cardmarket routing

\- market-v176 semantics

\- cost-basis-v177 semantics

\- portfolio-insights-v178 semantics

\- Supabase/cloud/storage contracts

\- search-price network isolation

\- PWA/offline regressions



`rareworth-v158-jp-artwork.patch` moet onaangeroerd en untracked blijven.



\## HoloDex v182 doel



De overdrachtszip/redesign is de productreferentie.



Het uiteindelijke doel is ZIP parity:

\- nieuwe Start/Home

\- waardegrafiek

\- 1W / 1M / 3M / 1J / Alles

\- setprogress

\- bijna complete sets

\- 3x3 binder

\- rijke kaartdetailpagina

\- zoekprijzen

\- share links

\- lokaal gehoste fonts

\- subtiele holo-stijl



Maar bekende bugs uit de zip mogen niet worden gereproduceerd.



Geen synthetische demo-data in productie.



\## History en prijsdata



Geen fake waardestijging door ontbrekende historische dekking.



TCGplayer/TCGCSV mag nooit als Cardmarket-historie worden gepresenteerd.



Bewaar en toon bron, valuta, tijdstip en metric correct.



Bij onduidelijke identity of variant: fail closed.



Als historische data niet eerlijk genoeg gemodelleerd kan worden:

niet gokken en expliciet rapporteren.



\## Belangrijkste regel



Betrouwbaarheid > snelheid.



Liever melden dat iets niet betrouwbaar uitvoerbaar is dan een onbewezen of onjuiste oplossing leveren.