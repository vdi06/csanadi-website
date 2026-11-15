# Csanádi Sportiskola 2026 – a központi JSON összes paramétere

**Forrás:** `json/config.json` · **Kiadás:** 28 · **Dátum:** 2026. november 15.

**Összesen 290 beállítható, egy helyen tárolt mező.** A lista a tényleges kiadási JSON-ból származik; szerkesztéshez nyisd meg a `tools/parameterek-szerkeszto.html` felületet.

A dátumértékek ISO 8601 formátumúak; a `null` korlátlan megjelenítést jelent. A darabszámok, időzítések, méretek és más globális kapcsolók a JSON-ból kerülnek a programokhoz. Az egyedi esemény, dokumentum és hír rekordjának saját dátuma a saját adatrekord egyetlen forrásértéke, nem másolat a globális konfigurációban.

## Adatséma (1 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `schemaVersion` | `"1.0.0"` | szöveg |

## Iskolai és globális adatok (15 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `site.name` | `"Csanádi Árpád Sportiskola, Általános Iskola és Gimnázium"` | szöveg |
| `site.baseUrl` | `"https://vdi06.github.io/csanadi-website/"` | szöveg |
| `site.locale` | `"hu-HU"` | szöveg |
| `site.contactPageId` | `"page:000063"` | szöveg |
| `site.shortName` | `"CSANÁDI"` | szöveg |
| `site.footerYear` | `2026` | szám |
| `site.address` | `"1143 Budapest, Őrnagy utca 5–7."` | szöveg |
| `site.email` | `"csanadi@csanadiiskola.hu"` | szöveg |
| `site.secretariatPhones` | `["+36 30 267 82 08", "+36 30 427 82 30"]` | lista |
| `site.omIdentifier` | `"200346"` | szöveg |
| `site.directorName` | `"Rúzsa Sándor"` | szöveg |
| `site.maintainerName` | `"Közép-Pesti Tankerületi Központ"` | szöveg |
| `site.maintainerAddress` | `"1149 Budapest, Mogyoródi út 21."` | szöveg |
| `site.motto` | `"Sport, tanulás, közösség."` | szöveg |
| `site.kretaUrl` | `"https://klik200346001.e-kreta.hu/"` | szöveg |

## Kezdőoldal (1 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `startPageId` | `"page:000001"` | szöveg |

## Tanév (1 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `currentSchoolYear` | `"2026/2027"` | szöveg |

## Navigáció (4 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `navigation.mode` | `"hash"` | szöveg |
| `navigation.maxDepth` | `3` | szám |
| `navigation.rememberExpanded` | `true` | logikai |
| `navigation.restoreScroll` | `true` | logikai |

## Adatfrissítés (6 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `refresh.structureSeconds` | `60` | szám |
| `refresh.activePageSeconds` | `60` | szám |
| `refresh.backgroundPause` | `true` | logikai |
| `refresh.maxConcurrentRequests` | `4` | szám |
| `refresh.minimumSeconds` | `15` | szám |
| `refresh.maximumSeconds` | `3600` | szám |

## Arculat (30 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `theme.defaultMode` | `"system"` | szöveg |
| `theme.allowManualOverride` | `true` | logikai |
| `theme.primary` | `"#10233D"` | szöveg |
| `theme.accent` | `"#D7B66E"` | szöveg |
| `theme.lightColors.page` | `"#D8D0C2"` | szöveg |
| `theme.lightColors.card` | `"#EEE7DC"` | szöveg |
| `theme.lightColors.light` | `"#D9D0C1"` | szöveg |
| `theme.lightColors.line` | `"#AA9C87"` | szöveg |
| `theme.lightColors.ink` | `"#172B3D"` | szöveg |
| `theme.lightColors.muted` | `"#344A5F"` | szöveg |
| `theme.lightColors.header` | `"#E6DDCD"` | szöveg |
| `theme.lightColors.footer` | `"#DBD1C0"` | szöveg |
| `theme.lightColors.nav` | `"#E1D7C6"` | szöveg |
| `theme.lightColors.veil` | `"rgba(216,208,194,.86)"` | szöveg |
| `theme.lightColors.sportGreen` | `"#BFE8C9"` | szöveg |
| `theme.lightColors.sportYellow` | `"#F6E5AA"` | szöveg |
| `theme.lightColors.chartOtherColors` | `["#517993", "#548580", "#8A944E", "#B27F66", "#7B8EAA", "#A67146"]` | lista |
| `theme.darkColors.page` | `"#0C1E31"` | szöveg |
| `theme.darkColors.card` | `"#162B41"` | szöveg |
| `theme.darkColors.light` | `"#1C354D"` | szöveg |
| `theme.darkColors.line` | `"#405A71"` | szöveg |
| `theme.darkColors.ink` | `"#F1EAD9"` | szöveg |
| `theme.darkColors.muted` | `"#BCCBDB"` | szöveg |
| `theme.darkColors.header` | `"#0C2136"` | szöveg |
| `theme.darkColors.footer` | `"#0A1A2B"` | szöveg |
| `theme.darkColors.nav` | `"#112C43"` | szöveg |
| `theme.darkColors.veil` | `"rgba(10,26,43,.86)"` | szöveg |
| `theme.darkColors.sportGreen` | `"#315F4A"` | szöveg |
| `theme.darkColors.sportYellow` | `"#766236"` | szöveg |
| `theme.darkColors.chartOtherColors` | `["#75A2C6", "#6AA7A0", "#ACB66C", "#C9947C", "#9CBBCA", "#D4A67D"]` | lista |

## Tartalomforrások (5 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `content.structurePath` | `"structure.json"` | szöveg |
| `content.mediaRegistryPath` | `"mediatar.json"` | szöveg |
| `content.collectionRoot` | `"entitasok"` | szöveg |
| `content.componentRoot` | `"komponensek"` | szöveg |
| `content.languagesPath` | `"nyelvek.json"` | szöveg |

## Adatvédelem (5 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `privacy.requireConsentForExternalEmbeds` | `true` | logikai |
| `privacy.analyticsEnabled` | `false` | logikai |
| `privacy.externalOrigins` | `[]` | lista |
| `privacy.requireExplicitApprovalForStudentNews` | `true` | logikai |
| `privacy.allowFictionalStudentSamples` | `true` | logikai |

## Kereső (20 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `search.enabled` | `true` | logikai |
| `search.indexCacheHours` | `12` | szám |
| `search.maxResults` | `40` | szám |
| `search.pageSize` | `12` | szám |
| `search.suggestionLimit` | `5` | szám |
| `search.datalistLimit` | `120` | szám |
| `search.textCharacterLimit` | `24000` | szám |
| `search.minimumFuzzyLength` | `3` | szám |
| `search.typoMaxDistance` | `1` | szám |
| `search.typoMinimumLength` | `5` | szám |
| `search.statsSessionLimit` | `20` | szám |
| `search.highlightDurationMs` | `3200` | szám |
| `search.jumpMaxAttempts` | `22` | szám |
| `search.jumpRetryMs` | `150` | szám |
| `search.quickSuggestions` | `["Felvételi", "Sporteredmények", "Eseménynaptár", "Dokumentumtár", "Képgaléria"]` | lista |
| `search.fuzzyWordLengthTolerance` | `6` | szám |
| `search.synonyms.felveteli` | `["jelentkezes", "beiratkozas"]` | lista |
| `search.synonyms.sporteredmenyek` | `["bajnoksag", "sportverseny"]` | lista |
| `search.synonyms.esemeny` | `["program", "rendezveny"]` | lista |
| `search.synonyms.dokumentum` | `["pdf", "letoltes"]` | lista |

## Teljesítmény és offline gyorsítótár (7 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `performance.cacheVersion` | `"csanadi-r28-20261115"` | szöveg |
| `performance.maxCacheMegabytes` | `50` | szám |
| `performance.respectReducedMotion` | `true` | logikai |
| `performance.mediaCacheEntries` | `100` | szám |
| `performance.offlineShellMaxAgeHours` | `24` | szám |
| `performance.offlinePrecacheFileMaxBytes` | `300000` | szám |
| `performance.offlinePrecacheMaxEntries` | `220` | szám |

## Megjelenítés, körmenü, dátumablakok és diagnosztika (180 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `runtime.round26.dataPath` | `"adatok/megkozelites-fejlodes-26.json"` | szöveg |
| `runtime.round26.mapRequireConsent` | `true` | logikai |
| `runtime.round26.mapProvider` | `"openstreetmap"` | szöveg |
| `runtime.round26.mapZoom` | `16` | szám |
| `runtime.round26.admissionLocalOnly` | `true` | logikai |
| `runtime.round26.admissionRetentionDays` | `60` | szám |
| `runtime.round26.goalMaximumEntries` | `40` | szám |
| `runtime.round26.goalRetentionDays` | `90` | szám |
| `runtime.round26.mediaRequirePublicationPermission` | `true` | logikai |
| `runtime.round26.consultationsRequireVerification` | `true` | logikai |
| `runtime.round26.accessibilityEvidenceRequired` | `true` | logikai |
| `runtime.round26.studyMaximumSessionMinutes` | `90` | szám |
| `runtime.round26.ecoMaximumDailyKilometres` | `100` | szám |
| `runtime.round26.changelogMaximumEntries` | `200` | szám |
| `runtime.round25.dataPath` | `"adatok/tanulas-kozosseg-25.json"` | szöveg |
| `runtime.round25.plannerMaximumEntries` | `80` | szám |
| `runtime.round25.plannerRetentionDays` | `30` | szám |
| `runtime.round25.plannerLocalOnly` | `true` | logikai |
| `runtime.round25.panoramaMaximumBytes` | `12582912` | szám |
| `runtime.round25.panoramaMinimumRatio` | `1.8` | szám |
| `runtime.round25.speechMaximumCharacters` | `12000` | szám |
| `runtime.round25.clubsRequireApproval` | `true` | logikai |
| `runtime.round25.alumniRequireConsent` | `true` | logikai |
| `runtime.round25.projectReportsRequirePublicSource` | `true` | logikai |
| `runtime.round25.faqMaximumDepth` | `8` | szám |
| `runtime.round24.dataPath` | `"adatok/orokseg-es-tudastar-24.json"` | szöveg |
| `runtime.round24.diffMaximumBytes` | `131072` | szám |
| `runtime.round24.diffMaximumLines` | `450` | szám |
| `runtime.round24.summaryMaximumYears` | `30` | szám |
| `runtime.round24.exportMaximumRecords` | `600` | szám |
| `runtime.round24.publicOnly` | `true` | logikai |
| `runtime.round24.privacyLocalOnly` | `true` | logikai |
| `runtime.round24.verifiedSourcesRequired` | `true` | logikai |
| `runtime.round24.historicalPartnersAreNotCurrentProof` | `true` | logikai |
| `runtime.round23.dataPath` | `"adatok/kozossegi-muhely-23.json"` | szöveg |
| `runtime.round23.volunteerMaxEntries` | `80` | szám |
| `runtime.round23.volunteerPlannedGoalHours` | `50` | szám |
| `runtime.round23.exportMaximumRecords` | `500` | szám |
| `runtime.round23.publishProjectsOnlyAfterConsent` | `true` | logikai |
| `runtime.round23.allowIllustrationsWithDisclaimer` | `true` | logikai |
| `runtime.round23.privacyLocalOnly` | `true` | logikai |
| `runtime.round23.verifiedSourcesRequired` | `true` | logikai |
| `runtime.round23.bilingualInformationalOnly` | `true` | logikai |
| `runtime.round22.dataPath` | `"adatok/iranytu-22.json"` | szöveg |
| `runtime.round22.qrIndexPath` | `"adatok/qr-index-22.json"` | szöveg |
| `runtime.round22.mediaPageSize` | `12` | szám |
| `runtime.round22.parentEventLimit` | `4` | szám |
| `runtime.round22.previewBaseUrl` | `"https://vdi06.github.io/csanadi-website/"` | szöveg |
| `runtime.round22.plannedFtpBaseUrl` | `"https://csanadi-bp.edu.hu/"` | szöveg |
| `runtime.round22.privacyLocalOnly` | `true` | logikai |
| `runtime.round22.verifyBeforePublishing` | `true` | logikai |
| `runtime.round21.maxAdmissionCompare` | `3` | szám |
| `runtime.round21.maxBundleFiles` | `12` | szám |
| `runtime.round21.maxBundleBytes` | `24000000` | szám |
| `runtime.round21.kioskMaxSlides` | `14` | szám |
| `runtime.round21.kioskRotationMs` | `8500` | szám |
| `runtime.round21.explorerDataPath` | `"adatok/felfedezo-21.json"` | szöveg |
| `runtime.round21.homePreferencesStorageVersion` | `1` | szám |
| `runtime.round21.privacyLocalOnly` | `true` | logikai |
| `runtime.hero.maxSlides` | `20` | szám |
| `runtime.hero.rotationDefaultMs` | `7500` | szám |
| `runtime.hero.rotationMinimumMs` | `5000` | szám |
| `runtime.hero.rotationMaximumMs` | `12000` | szám |
| `runtime.hero.swipeThresholdPx` | `55` | szám |
| `runtime.hero.pictureCacheEntries` | `20` | szám |
| `runtime.hero.startsAt` | `null` | null/dátum |
| `runtime.hero.endsAt` | `null` | null/dátum |
| `runtime.hero.mobileCutoutRadiusPx` | `68` | szám |
| `runtime.hero.smallMobileCutoutRadiusPx` | `58` | szám |
| `runtime.hero.desktopCutoutRadiusPx` | `118` | szám |
| `runtime.hero.tabletCutoutRadiusPx` | `94` | szám |
| `runtime.navigation.outerRingMinWidthPx` | `1100` | szám |
| `runtime.navigation.outerRingRadiusMaxPx` | `425` | szám |
| `runtime.navigation.outerRingRadiusWidthRatio` | `0.39` | szám |
| `runtime.navigation.outerRingRadiusHeightRatio` | `0.46` | szám |
| `runtime.navigation.outerRingArcMaxDegrees` | `135` | szám |
| `runtime.navigation.outerRingArcSpacingDegrees` | `34` | szám |
| `runtime.navigation.mobileSubmenuMaxWidthPx` | `760` | szám |
| `runtime.navigation.menuFocusDelayMs` | `90` | szám |
| `runtime.navigation.typeAheadResetMs` | `800` | szám |
| `runtime.navigation.mobileMenuDefaultMode` | `"orbit"` | szöveg |
| `runtime.documents.maxSavedFilters` | `20` | szám |
| `runtime.documents.suggestionLimit` | `35` | szám |
| `runtime.documents.searchDelayMs` | `130` | szám |
| `runtime.documents.previewCheckDelayMs` | `3500` | szám |
| `runtime.documents.defaultView` | `"cards"` | szöveg |
| `runtime.documents.defaultSort` | `"newest"` | szöveg |
| `runtime.documents.refreshSeconds` | `75` | szám |
| `runtime.calendar.defaultView` | `"month"` | szöveg |
| `runtime.calendar.maximumVisibleEvents` | `30` | szám |
| `runtime.sportsResults.maximumPreviewCards` | `12` | szám |
| `runtime.timing.toastDurationMs` | `2800` | szám |
| `runtime.timing.searchFocusDelayMs` | `0` | szám |
| `runtime.timing.searchJumpDelayMs` | `90` | szám |
| `runtime.timing.homeDashboardRefreshMs` | `20000` | szám |
| `runtime.timing.homeDashboardCleanupMs` | `15000` | szám |
| `runtime.timing.homeCounterAnimationMs` | `620` | szám |
| `runtime.timing.studentAchievementsRefreshMs` | `300000` | szám |
| `runtime.timing.calendarRefreshMs` | `60000` | szám |
| `runtime.timing.dailySportNewsRefreshMs` | `300000` | szám |
| `runtime.timing.sportsCarouselRotationMs` | `6800` | szám |
| `runtime.timing.chartLoadTimeoutMs` | `4500` | szám |
| `runtime.timing.portalOpenDurationMs` | `5200` | szám |
| `runtime.timing.portalCleanupMs` | `470` | szám |
| `runtime.timing.entranceOpenDelayMs` | `1250` | szám |
| `runtime.timing.entranceFinishDelayMs` | `6500` | szám |
| `runtime.timing.entranceOpenDurationMs` | `2200` | szám |
| `runtime.timing.entranceCleanupMs` | `450` | szám |
| `runtime.studentAchievements.featuredDays` | `7` | szám |
| `runtime.studentAchievements.demoDaysAgoMaximum` | `1500` | szám |
| `runtime.studentAchievements.dataPath` | `"adatok/tanuloi-sikerek.json"` | szöveg |
| `runtime.events.refreshSeconds` | `60` | szám |
| `runtime.sports.refreshSeconds` | `60` | szám |
| `runtime.news.maximumAgeHours` | `72` | szám |
| `runtime.news.maximumEditorRows` | `18` | szám |
| `runtime.news.sampleTitlePrefix` | `"MINTA – "` | szöveg |
| `runtime.news.officialSourceHost` | `"csanadi-bp.edu.hu"` | szöveg |
| `runtime.tools.visualPreviewMaximumBlocks` | `50` | szám |
| `runtime.tools.imageMaximumFiles` | `24` | szám |
| `runtime.tools.imageTargetWidths` | `[480, 960, 1440]` | lista |
| `runtime.tools.imageQuality` | `0.78` | szám |
| `runtime.tools.imageFormats` | `["image/webp", "image/avif"]` | lista |
| `runtime.tools.imageMaximumInputBytes` | `20971520` | szám |
| `runtime.tools.relationshipMaximumNodes` | `90` | szám |
| `runtime.tools.releaseMaximumZipBytes` | `104857600` | szám |
| `runtime.tools.accessibilityMaximumResults` | `160` | szám |
| `runtime.tools.mediaImportMaximumBytes` | `104857600` | szám |
| `runtime.tools.pageJsonMaximumBytes` | `500000` | szám |
| `runtime.tools.sportNewsJsonMaximumBytes` | `1000000` | szám |
| `runtime.tools.auditMaximumIssues` | `150` | szám |
| `runtime.tools.auditConcurrentRequests` | `4` | szám |
| `runtime.tools.mediaReportTopEntries` | `12` | szám |
| `runtime.tools.releaseDiffMaximumRows` | `200` | szám |
| `runtime.tools.mediaWarningThresholdBytes` | `300000` | szám |
| `runtime.tools.minimumTextContrast` | `4.5` | szám |
| `runtime.display.bilingualPanelEnabled` | `true` | logikai |
| `runtime.display.bilingualDefaultLanguage` | `"hu"` | szöveg |
| `runtime.display.relatedPages` | `8` | szám |
| `runtime.display.homepageUpcomingEvents` | `3` | szám |
| `runtime.display.homepagePreviewEvents` | `4` | szám |
| `runtime.display.upcomingEventPanel` | `6` | szám |
| `runtime.display.featuredStudents` | `10` | szám |
| `runtime.display.otherStudents` | `4` | szám |
| `runtime.display.calendarCollapsedItems` | `5` | szám |
| `runtime.display.calendarExpandedItems` | `100` | szám |
| `runtime.display.relatedCards` | `4` | szám |
| `runtime.display.relatedPreviewCards` | `2` | szám |
| `runtime.display.sportsPhotoCarousel` | `12` | szám |
| `runtime.display.sportsSuccessSidebar` | `5` | szám |
| `runtime.display.galleryCollapsedPeriods` | `5` | szám |
| `runtime.display.galleryBatch` | `24` | szám |
| `runtime.display.documentCollectionBatch` | `6` | szám |
| `runtime.display.documentRelated` | `4` | szám |
| `runtime.display.documentTeasers` | `3` | szám |
| `runtime.display.newsTeasers` | `3` | szám |
| `runtime.display.newsPageSize` | `6` | szám |
| `runtime.display.dailyNewsFull` | `18` | szám |
| `runtime.display.dailyNewsCompact` | `6` | szám |
| `runtime.display.mediaBatch` | `12` | szám |
| `runtime.display.mediaCompactInitial` | `9` | szám |
| `runtime.display.mediaFullInitial` | `18` | szám |
| `runtime.display.mediaVideoMax` | `15` | szám |
| `runtime.display.genericListCards` | `6` | szám |
| `runtime.accessibility.targetMinimumPx` | `40` | szám |
| `runtime.accessibility.focusOutlinePx` | `3` | szám |
| `runtime.accessibility.motionReductionHonored` | `true` | logikai |
| `runtime.diagnostics.maxErrorEntries` | `200` | szám |
| `runtime.diagnostics.summaryRefreshSeconds` | `60` | szám |
| `runtime.diagnostics.slowestResourceCount` | `5` | szám |
| `runtime.diagnostics.largestResourceCount` | `5` | szám |
| `runtime.diagnostics.targetLcpMs` | `2500` | szám |
| `runtime.diagnostics.targetCls` | `0.1` | szám |
| `runtime.diagnostics.targetFcpMs` | `1800` | szám |
| `runtime.release.minimumManifestEntries` | `700` | szám |
| `runtime.release.expectedPageCount` | `66` | szám |
| `runtime.release.updateCheckSeconds` | `300` | szám |
| `runtime.offlineReader.maxSelectedPages` | `20` | szám |
| `runtime.offlineReader.maximumStorageBytes` | `52428800` | szám |
| `runtime.offlineReader.maxFileBytes` | `524288` | szám |
| `runtime.offlineReader.maxParallelFetches` | `3` | szám |

## Iskolai modulok (15 mező)

| Pontos JSON-útvonal | Jelenlegi érték | Típus |
|---|---|---|
| `modules2026.gate.enabled` | `true` | logikai |
| `modules2026.gate.showOncePerSession` | `true` | logikai |
| `modules2026.gate.reducedMotionSkip` | `true` | logikai |
| `modules2026.clock.timezone` | `"Europe/Budapest"` | szöveg |
| `modules2026.clock.tickSeconds` | `1` | szám |
| `modules2026.calendar.displayOnlyVerifiedDates` | `true` | logikai |
| `modules2026.calendar.dataPath` | `"adatok/esemenyek.json"` | szöveg |
| `modules2026.bell.requireVerifiedForOfficialBadge` | `true` | logikai |
| `modules2026.bell.dataPath` | `"adatok/csengetesi-rend.json"` | szöveg |
| `modules2026.gallery.imageCount` | `48` | szám |
| `modules2026.gallery.dataPath` | `"adatok/kepgaleria.json"` | szöveg |
| `modules2026.social.requireVerifiedLinksForOfficialBadge` | `true` | logikai |
| `modules2026.social.dataPath` | `"adatok/social.json"` | szöveg |
| `modules2026.staff.onlyPublishedPeople` | `true` | logikai |
| `modules2026.staff.dataPath` | `"adatok/tantestulet.json"` | szöveg |

## Használati sorrend

1. Nyisd meg a `tools/parameterek-szerkeszto.html` oldalt a működő HTTP(S)-webhelyen.
2. A mezőt a pontos JSON-útvonallal keresd meg; állítsd át és futtasd az Ellenőrzés műveletet.
3. Töltsd le a `config.json` fájlt, és a helyi csomag `json/config.json` útvonalán cseréld le.
4. Az új kiadáshoz számítsd újra a `release-manifest.json` méret- és SHA-256 adatait, ellenőrizd, majd tesztkörnyezetben próbáld ki.
5. Az éles FTP-re semmilyen szerkesztő nem tölt fel automatikusan.

A PDF- és webes kézikönyv a 66 oldalt, tizenhárom szerkesztőeszközt és minden jelenlegi paramétert külön-külön tartalmaz.
