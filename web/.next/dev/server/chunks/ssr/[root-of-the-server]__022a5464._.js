module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/web/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/web/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/web/app/not-found.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/web/app/not-found.tsx [app-rsc] (ecmascript)"));
}),
"[project]/shared/types.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Contract shared by the plugin (#6), web app (#7) and seed (#5).
// Change it only in a pull request of its own (see CONTRIBUTING.md).
__turbopack_context__.s([
    "TIERS",
    ()=>TIERS
]);
const TIERS = [
    'common',
    'middle',
    'top',
    'legend'
];
}),
"[project]/data/series1.sample.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v([{"id":"s1-harrison-barnes","number":120,"name":"Harrison Barnes","tier":"common","position":"SF","teams":["DAL","SAC"],"season":"2018-19","games":77,"pts":16.4,"reb":4.7,"ast":1.6,"stl":0.6,"blk":0.1,"tov":1.3,"fp":25.2},{"id":"s1-devin-booker","number":40,"name":"Devin Booker","tier":"middle","position":"SG","teams":["PHX"],"season":"2022-23","games":53,"pts":27.8,"reb":4.5,"ast":5.5,"stl":1.0,"blk":0.3,"tov":2.7,"fp":42.7},{"id":"s1-stephen-curry","number":23,"name":"Stephen Curry","tier":"top","position":"PG","teams":["GSW"],"season":"2015-16","games":79,"pts":30.1,"reb":5.4,"ast":6.7,"stl":2.1,"blk":0.2,"tov":3.3,"fp":50.2},{"id":"s1-legend-lebron-james","number":151,"name":"LeBron James","tier":"legend","position":"SF","teams":["CLE"],"game":"2016 Finals G7 at GSW","date":"2016-06-19","pts":27,"reb":11,"ast":11,"stl":2,"blk":3,"tov":5,"fp":66.7},{"id":"s1-legend-stephen-curry","number":152,"name":"Stephen Curry","tier":"legend","position":"PG","teams":["GSW"],"game":"Regular season at OKC","date":"2016-02-27","pts":46,"reb":6,"ast":6,"stl":2,"blk":0,"tov":4,"fp":64.2}]);}),
"[project]/web/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALID_ID",
    ()=>VALID_ID,
    "cards",
    ()=>cards,
    "profiles",
    ()=>profiles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$series1$2e$sample$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/data/series1.sample.json (json)");
;
// Publishable key: safe to ship, RLS makes every table read-only for clients.
const URL = process.env.SUPABASE_URL ?? 'https://taeiympniwgxcpynlbsh.supabase.co';
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_MKquRgBdbxG1-XC7wmLBTA_2sJc0gHD';
async function get(path) {
    const res = await fetch(`${URL}/rest/v1/${path}`, {
        headers: {
            apikey: KEY
        },
        next: {
            revalidate: 60
        }
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    return res.json();
}
const COLS = 'id,number,name,tier,position,teams,season,games,game,date,pts,reb,ast,stl,blk,tov,fp';
async function cards() {
    const rows = await get(`cards?select=${COLS},pulls(count)&order=number`);
    // shortcut: an unseeded database shows the 5 sample cards; drop once #5 has seeded prod.
    if (rows.length === 0) return __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$series1$2e$sample$2e$json__$28$json$29$__["default"].map((c)=>({
            ...c,
            pulls: 0
        })).sort((a, b)=>a.number - b.number);
    return rows.map((r)=>({
            ...r,
            pulls: r.pulls[0]?.count ?? 0
        }));
}
const VALID_ID = /^[A-Za-z0-9-]{1,39}$/;
async function profiles(id) {
    if (!VALID_ID.test(id)) return [] // keeps the id safe to put in the PostgREST filter
    ;
    const rows = await get(`profiles?select=public_id,github_login,pulls(card_id)&or=(public_id.eq.${id},github_login.ilike.${id})&order=created_at`);
    return rows.map((r)=>({
            ...r,
            owned: new Set(r.pulls.map((p)=>p.card_id))
        }));
}
}),
"[project]/web/app/card.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CardTile",
    ()=>CardTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function CardTile({ card, total, locked, footer }) {
    const no = `#${String(card.number).padStart(3, '0')}/${total}`;
    if (locked) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: `card locked ${card.tier}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "no",
                children: no
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "name",
                children: "Locked"
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 10,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tier",
                children: card.tier
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/app/card.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: `card ${card.tier}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "no",
                children: no
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "name",
                children: card.name
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "meta",
                children: [
                    card.position,
                    " · ",
                    card.teams.join('/'),
                    " ·",
                    ' ',
                    card.tier === 'legend' ? `${card.game}, ${card.date}` : `${card.season}, ${card.games} G`
                ]
            }, void 0, true, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "stats",
                children: [
                    card.pts,
                    " PTS · ",
                    card.reb,
                    " REB · ",
                    card.ast,
                    " AST",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/web/app/card.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    card.stl,
                    " STL · ",
                    card.blk,
                    " BLK · ",
                    card.tov,
                    " TOV"
                ]
            }, void 0, true, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fp",
                children: [
                    card.fp,
                    " FP"
                ]
            }, void 0, true, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tier",
                children: card.tier
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            footer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "foot",
                children: footer
            }, void 0, false, {
                fileName: "[project]/web/app/card.tsx",
                lineNumber: 28,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/app/card.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
}),
"[project]/web/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/types.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$app$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/app/card.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
async function Home({ searchParams }) {
    const { tier } = await searchParams;
    const all = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cards"])();
    const active = __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TIERS"].find((t)=>t === tier);
    const shown = active ? all.filter((c)=>c.tier === active) : all;
    const count = (t)=>all.filter((c)=>c.tier === t).length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Series 1"
            }, void 0, false, {
                fileName: "[project]/web/app/page.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "tiers",
                "aria-label": "Filter by tier",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        "aria-current": !active ? 'page' : undefined,
                        children: [
                            "all (",
                            all.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TIERS"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: `/?tier=${t}`,
                            "aria-current": active === t ? 'page' : undefined,
                            children: [
                                t,
                                " (",
                                count(t),
                                ")"
                            ]
                        }, t, true, {
                            fileName: "[project]/web/app/page.tsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/web/app/page.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid",
                children: shown.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$app$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardTile"], {
                        card: c,
                        total: all.length,
                        footer: `pulled ${c.pulls} ${c.pulls === 1 ? 'time' : 'times'}`
                    }, c.id, false, {
                        fileName: "[project]/web/app/page.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/web/app/page.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/web/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/web/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__022a5464._.js.map