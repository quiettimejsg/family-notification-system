[中文](#zh) * [English](#en)
<a id="zh"></a>

# 家府通傳之制（Family Notification System）

## 項目要略
家府通傳之制者，乃戶內訊息傳遞之輕簡網頁應用也。具多語切換、文牘附件上呈、通牒品級分判、天時顯像諸能，助族人高效共享要聞。

## 功能諸端
- **多語襄助**：華英雙語可互易（藉頂端語鈕）
- **通牒品級**：設急迫/緊要/尋常三階（異色標識）
- **文牘附件**：可上呈圖畫、文書、音影諸式
- **實時新載**：擊新載鈕（↻）即獲最新通牒
- **應變佈局**：適配諸般屏幅（電腦/平板/手機）
- **天時顯像**：昭示當邑氣候寒溫
- **邑擇之能**：可搜邑名而擇，兼有定位之能

## 技藝棧積
- 前樞：HTML5/CSS3/JavaScript（ES6+）、Material Icons圖符庫
- 後樞：Node.js（Express之架）、SQLite藏書閣
- 依項管理：npm

## 安裝行用
### 預備
- Node.js（v14+）
- npm（隨Node.js自具）

### 步驟
1. 克隆項目至本機
   ```bash
   git clone https://github.com/your-username/family-notification-system.git
   ```
2. 安依項（於根目行）
   ```bash
   npm install
   ```
3. 啟侍者
   ```bash
   npm start
   ```
4. 詣前樞
   啟瀏器詣 `http://localhost:3000`

## 用度指要
### 添通牒
1. 填題首與正文
2. 擇通牒品級（默為尋常）
3. 擊「上文牘」添附件（可略）
4. 擊「呈遞」發通牒

### 易言語
擊頂端「A/文」鈕切華英之面

### 新載通牒
擊頂端新載圖符（↻）獲通牒新錄

### 觀天時
1. 擊頂端天時圖符或邑名啟邑擇器
2. 於索框入邑名或自錄揀選
3. 擇定即顯該邑實時天時

## 制配指要
- 藏書閣制配：修 `server/database.js` 調SQLite接參
- 上呈路徑：默儲於 `server/uploads` 目（可修 `server/routes.js` 中 `uploadPath` 變量）
- 多語文本：修 `public/i18n.js` 中 `translations` 物擴語助

## 貢策指要
1. 呈Issue述功能求或謬
2. Fork項目創特支（如 `feature/new-feature`）
3. 呈Pull Request並繫對應Issue

## 授約
AGPL-3.0 License
版權所有 (c) 2025 quiettimejsg

---
<a id="en"></a>

# Þæs Hīredes Bodcræft (The Household's Message-Craft)

## Stafa Gehwyrft
Þes Hīredes Bodcræft is lytel webb-geweorc for bodena gearnunga betwēonan hīwum. Hē hæfþ manigfealde cræftas, swelce missenlicu gereordu, boda hāda tōdǣlung, īecnung mid gewritum, and wederes īewung, þæt hē fultumie þǣm hīredmenn tō dǣlenne hefige bodan hrædlīce.

## Cræftas
- **Fela Gereorda Fultum**: Englisc and Cīnisc magon bēon āwended þurh þone cnæpp beufan.
- **Boda Hāda**: Þrēo hāda sind gesett: *Ofostlic*, *Heardlic*, and *Ungemetlic* (mid missenlicum bleom gemearcod).
- **Ġewritena Īecnung**: Man mæg īecan bīlidu, bēc, and sanges drēamas.
- **Nīwung on Stunde**: Cnyssa þæt nīwunge tācen (↻) for þā nīwestan bodan tō fōnne.
- **Wendiende Scēawung**: Hē wile hine anwealgan wel on missenlicum scēawerum (bord-searu, flat-searu, hand-searu).
- **Wederes Īewung**: Īeweþ þæt weder and þā hǣtan þǣre stōwe.
- **Stōwe Cyre Mægen**: Man mæg sēcan and cēosan stōwe be naman oþþe findan þurh his agene stede.

## Cræfta Stæpelas
- **Foran-geweorc**: HTML5/CSS3/JavaScript (ES6+), and Material Icons tācenhord.
- **Bæc-geweorc**: Node.js (mid Express fremmenne), and SQLite bōchord.
- **Weorca Rǣdung**: npm

## Insettung and Brūcung
### Gearwung
- Node.js (weorþscipe 14 oþþe māra)
- npm (cymeþ mid Node.js)

### Stapas
1. Þis geweorc tō þīnum lande āhladan
   ```bash
   git clone [https://github.com/your-username/family-notification-system.git](https://github.com/your-username/family-notification-system.git)

 * Þā þearflican þing settan (gang intō þone wyrtwalan)
   npm install

 * Þone þegn onstellan
   npm start

 * Þæt foran-geweorc sēcan
   Opena þīnne webb-sēcend and gang tō http://localhost:3000
Brūces Lār
Bodan Īecan
 * Fyll þone hēafodstaf and þæt bod in.
 * Cēos þone hād þæs bodan (ungemetlic is se gewunelica).
 * Cnyssa "Ġewrit Īecan" for þīnum īecnunge (þēah man ne þurfe).
 * Cnyssa "Sendan" for þæt bod tō āsendenne.
Gereorde Wendan
Cnyssa þone "A/文" cnæpp beufan for þæt gereorde tō wendanne.
Bodan Nīwian
Cnyssa þæt nīwunge tācen (↻) beufan for þā nīwestan bodan tō sēonne.
On Weder Lōcian
 * Cnyssa þæt wederes tācen oþþe þone naman þǣre stōwe beufan.
 * Sēc þā stōwe oþþe cēos fram þǣm getele.
 * Þæt gecorene weder biþ sōna īewed.
Mearcunge Lār
 * Bōchordes Mearcung: Wende server/database.js tō brēmanne þā gemōtcræftas þæs SQLite.
 * Īecnunga Pæþ: Se pæþ is on server/uploads geseted (man mæg wendan þone uploadPath in server/routes.js).
 * Gereorda Gewritu: Īec nīwu gereordu þurh þæt translations þing in public/i18n.js.
Giefan Rǣdes Lār
 * Senda Issue ymb þīnne willan oþþe þæt unriht þe þū funde.
 * Forca þis geweorc and wyrce nīwne telgor (swelce feature/new-feature).
 * Senda Pull Request and hine gebind wiþ þæt rihte Issue.
Lēaf
AGPL-3.0 Lēaf
Eall riht gehalgod (c) 2025 quiettimejsg