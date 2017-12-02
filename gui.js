var Config;
(function (Config) {
    Config.domAbbrev = {
        "w": "width",
        "h": "height",
        "t": "top",
        "l": "left",
        "ta": "textarea",
        "ovf": "overflow",
        "ds": "dragstart",
        "md": "mousedown",
        "mm": "mousemove",
        "mo": "mouseout",
        "mu": "mouseup",
        "cur": "cursor",
        "ptr": "pointer",
        "mv": "move",
        "pd": "padding",
        "pdt": "padding-top",
        "pdl": "padding-left",
        "pdb": "padding-bottom",
        "pdr": "padding-right",
        "mg": "margin",
        "mgt": "margin-top",
        "mgl": "margin-left",
        "mgb": "margin-bottom",
        "mgr": "margin-right",
        "fs": "font-size",
        "bc": "background-color",
        "bg": "background",
        "bs": "border-spacing",
        "bcs": "border-collapse",
        "dr": "draggable",
        "op": "opacity",
        "v": "value",
        "lb": "label",
        "ff": "font-family",
        "ms": "monospace",
        "pos": "position",
        "abs": "absolute",
        "rel": "relative"
    };
    function getAbbrev(p) {
        if (abbrev[p] != undefined)
            return abbrev[p];
        return p;
    }
    Config.getAbbrev = getAbbrev;
})(Config || (Config = {}));
var Misc;
(function (Misc) {
    Misc.defaultSortFunc = ((a, b) => {
        if ((a == undefined) && (b == undefined))
            return 0;
        if ((a != undefined) && (b == undefined))
            return 1;
        if ((a == undefined) && (b != undefined))
            return -1;
        if ((typeof a == "number") && (typeof b == "number"))
            return a - b;
        a = "" + a;
        b = "" + b;
        return a.localeCompare(b);
    });
    function isUndefined(x) {
        return ((x == undefined) || (x == null) || (x == "null"));
    }
    Misc.isUndefined = isUndefined;
})(Misc || (Misc = {}));
var Vectors;
(function (Vectors) {
    class ScreenVector {
        constructor(_x, _y) { this.x = _x; this.y = _y; }
        Plus(sv) {
            return new ScreenVector(this.x + sv.x, this.y + sv.y);
        }
        Minus(sv) {
            return new ScreenVector(this.x - sv.x, this.y - sv.y);
        }
    }
    Vectors.ScreenVector = ScreenVector;
    class Square {
        constructor(_file, _rank) { this.file = _file; this.rank = _rank; }
        Plus(sq) {
            return new Square(this.file + sq.file, this.rank + sq.rank);
        }
        Minus(sq) {
            return new Square(this.file - sq.file, this.rank - sq.rank);
        }
    }
    Vectors.Square = Square;
    class Piece {
        constructor() {
            this.kind = "-";
            this.color = 0;
        }
    }
    Vectors.Piece = Piece;
    class Move {
        constructor(_fsq, _tsq, _prompiece = new Piece()) {
            this.prompiece = new Piece();
            this.fsq = _fsq;
            this.tsq = _tsq;
            this.prompiece = _prompiece;
        }
    }
    Vectors.Move = Move;
    class Vect {
        constructor(_x, _y) {
            this.x = _x;
            this.y = _y;
        }
        calctrig(r, multrby = Math.PI) {
            this.sin = Math.sin(r * multrby);
            this.cos = Math.cos(r * multrby);
        }
        r(r) {
            this.calctrig(r);
            return new Vect(this.x * this.cos - this.y * this.sin, this.x * this.sin + this.y * this.cos);
        }
        n(l) {
            let c = (l / this.l());
            return new Vect(this.x * c, this.y * c);
        }
        u() { return this.n(1); }
        p(v) {
            return new Vect(this.x + v.x, this.y + v.y);
        }
        m(v) {
            return new Vect(this.x - v.x, this.y - v.y);
        }
        i() {
            return new Vect(-this.x, -this.y);
        }
        s(s) {
            return new Vect(this.x * s, this.y * s);
        }
        l() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
    }
    Vectors.Vect = Vect;
    let INFINITE_COORD = 1E6;
    class Polygon {
        constructor() {
            this.vects = [];
        }
        a(v) {
            this.vects.push(v);
            return this;
        }
        normalize(overwrite = true) {
            let minx = INFINITE_COORD;
            let miny = INFINITE_COORD;
            let maxx = -INFINITE_COORD;
            let maxy = -INFINITE_COORD;
            this.vects.map(v => {
                if (v.x < minx)
                    minx = v.x;
                if (v.y < miny)
                    miny = v.y;
                if (v.x > maxx)
                    maxx = v.x;
                if (v.y > maxy)
                    maxy = v.y;
            });
            let min = new Vect(minx, miny);
            let max = new Vect(maxx, maxy);
            this.shift = min.i();
            this.size = max.m(min);
            if (overwrite) {
                this.vects = this.vects.map(v => v.p(this.shift));
            }
            return this;
        }
        // should only be called on a normalized polygon
        reportSvg(bcol = "#dfdf3f") {
            let points = this.vects.map(v => (v.x + "," + v.y)).join(" ");
            return `
<svg width="${this.size.x}" height="${this.size.y}" style="position:absolute;top:0px;left:0px;">
<polygon points="${points}" style="fill:${bcol};stroke-width:0px;">
</svg>
`;
        }
    }
    Vectors.Polygon = Polygon;
    class Arrow {
        constructor(from, to, params) {
            let widthfactor = params["widthfactor"] || 0.1;
            let handlelength = params["handlelength"] || 0.7;
            let headfactor = params["headfactor"] || 0.2;
            let constantwidth = params["constantwidth"] || 0.0;
            let cw = (constantwidth != 0.0);
            let diff = to.m(from);
            let width = cw ? constantwidth : diff.l() * widthfactor;
            let bottomright = cw ? diff.n(constantwidth / 2.0).r(0.5) : diff.n(width / 2.0).r(0.5);
            let bottomleft = bottomright.i();
            let handle = cw ? diff.n(diff.l() - 3.0 * constantwidth) : diff.n(diff.l() * handlelength);
            let headfromright = bottomright.p(handle);
            let headfromleft = bottomleft.p(handle);
            let headtoright = headfromright.p(cw ? bottomright.s(2.0) : bottomright.n(diff.l() * headfactor));
            let headtoleft = headfromleft.p(cw ? bottomleft.s(2.0) : bottomleft.n(diff.l() * headfactor));
            let pg = new Polygon().
                a(bottomright).
                a(headfromright).
                a(headtoright).
                a(diff).
                a(headtoleft).
                a(headfromleft).
                a(bottomleft).
                normalize();
            this.svgorig = to.m(pg.vects[3]);
            this.svg = pg.reportSvg(params["color"]);
        }
    }
    Vectors.Arrow = Arrow;
})(Vectors || (Vectors = {}));
var TextEncodingUtils;
(function (TextEncodingUtils) {
    class TEnc {
        constructor(label, options) {
            this.tenc = new TextEncoder(label, options);
        }
        encode(input, options) {
            return this.tenc.encode(input, options);
        }
    }
    TextEncodingUtils.TEnc = TEnc;
    class TDec {
        constructor(label, options) {
            this.tdec = new TextDecoder(label, options);
        }
        decode(input, options) {
            return this.tdec.decode(input, options);
        }
    }
    TextEncodingUtils.TDec = TDec;
    let tdec = new TDec();
    let tenc = new TEnc();
    function encode(input) {
        return tenc.encode(input);
    }
    TextEncodingUtils.encode = encode;
    function decode(input) {
        return tdec.decode(input);
    }
    TextEncodingUtils.decode = decode;
})(TextEncodingUtils || (TextEncodingUtils = {}));
class TextAsset {
    constructor(_url) {
        this.isready = false;
        this.isfailed = false;
        this.url = _url;
    }
    load() {
        try {
            fetch(this.url).then(response => response.arrayBuffer()).then(bytes => this.onload(bytes));
        }
        catch (e) {
            this.isfailed = true;
        }
    }
    onload(bytes) {
        let view = new Uint8Array(bytes);
        this.text = TextEncodingUtils.decode(view);
        this.isready = true;
    }
    ready() {
        return this.isready;
    }
    failed() {
        return this.isfailed;
    }
    asJson() {
        return JSON.parse(this.text);
    }
}
class AjaxAsset {
    constructor(_reqjson) {
        this.url = "http://localhost:9000/ajax";
        this.isready = false;
        this.isfailed = false;
        this.reqjson = _reqjson;
    }
    load() {
        let body = JSON.stringify(this.reqjson);
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        try {
            fetch(this.url, {
                method: 'POST',
                headers: headers,
                body: body
            }).then(response => response.json()).then(data => this.onload(data));
        }
        catch (e) {
            this.isfailed = true;
        }
    }
    onload(data) {
        this.resjson = data;
        this.isready = true;
    }
    ready() {
        return this.isready;
    }
    failed() {
        return this.isfailed;
    }
}
class AssetLoader {
    constructor() {
        this.WAIT = 250;
        this.RETRIES = 40;
        this.items = [];
        this.errorcallback = function () {
            //console.log("loading assets failed");
        };
    }
    add(l) {
        this.items.push(l);
        return this;
    }
    setcallback(_callback) {
        this.callback = _callback;
        return this;
    }
    seterrorcallback(_errorcallback) {
        this.errorcallback = _errorcallback;
        return this;
    }
    load() {
        this.items.map(item => item.load());
        //console.log("loading assets...")
        this.retries = 0;
        setTimeout(this.loadwait.bind(this), this.WAIT);
    }
    loadwait() {
        if (this.items.every(value => value.failed())) {
            this.errorcallback();
            return;
        }
        for (let i in this.items) {
            if (!this.items[i].ready()) {
                this.retries++;
                if (this.retries <= this.RETRIES) {
                    //console.log("waiting for assets to load... try "+this.retries)
                    setTimeout(this.loadwait.bind(this), this.WAIT);
                    return;
                }
                else {
                    this.errorcallback();
                    return;
                }
            }
        }
        //console.log("assets loaded ok")
        if (this.callback != undefined)
            this.callback();
    }
}
var abbrev = Config.domAbbrev;
var getAbbrev = Config.getAbbrev;
var DomUtils;
(function (DomUtils) {
    function limit(x, min, max) {
        if (x < min)
            return min;
        if (x > max)
            return max;
        return x;
    }
    DomUtils.limit = limit;
})(DomUtils || (DomUtils = {}));
var limit = DomUtils.limit;
class JsonSerializable {
    storeId() {
        return this.id;
    }
    constructor(id) {
        this.id = id;
    }
    fromJson(json) { }
    fromJsonText(jsontext) {
        try {
            let json = JSON.parse(jsontext);
            this.fromJson(json);
        }
        catch (e) { }
    }
    toJsonText() {
        return JSON.stringify(this);
    }
    toJson() {
        return JSON.parse(this.toJsonText());
    }
    store() {
        let storeid = this.storeId();
        let jsontext = this.toJsonText();
        localStorage.setItem(storeid, jsontext);
        //console.log("store",storeid,jsontext)
    }
    stored() {
        return localStorage.getItem(this.storeId());
    }
    hasStored() {
        return !Misc.isUndefined(this.stored());
    }
    fromStored() {
        //console.log("fromStored",this.id,this.stored())
        if (!this.hasStored())
            return;
        try {
            this.fromJsonText(this.stored());
        }
        catch (e) { }
    }
    copyFrom(js) {
        this.fromJsonText(js.toJsonText());
    }
}
class e extends JsonSerializable {
    constructor(tag, id = null) {
        super(id);
        this.key = ""; // for sorting content
        tag = getAbbrev(tag);
        this.e = document.createElement(tag);
        if (id != null)
            e.l[id] = this;
    }
    focus() { this.e.focus(); return this; }
    blur() { this.e.blur(); return this; }
    k(key) {
        this.key = key;
        return this;
    }
    pr() { this.s("pos", "rel"); return this; }
    pa() { this.s("pos", "abs"); return this; }
    bu(name) { this.s("bg", `url(assets/images/backgrounds/${name})`); return this; }
    o(l = 0, t = 0) {
        return this.px("l", l).px("t", t);
    }
    z(w = 0, h = 0) {
        return this.px("w", w).px("h", h);
    }
    r(l = 0, t = 0, w = 0, h = 0) {
        return this.o(l, t).z(w, h);
    }
    c() {
        return getComputedStyle(this.e);
    }
    static getPx(v) {
        v = v.replace("px", "");
        return parseFloat(v);
    }
    cpx(p) {
        return e.getPx(this.c()[getAbbrev(p)]);
    }
    a(es) {
        es.map(e => this.e.appendChild(e.e));
        return this;
    }
    s(p, s) {
        p = getAbbrev(p);
        s = getAbbrev(s);
        this.e.style[p] = s;
        return this;
    }
    n(p, n) {
        return this.s(p, "" + n);
    }
    px(p, n) {
        return this.s(p, n + "px");
    }
    ae(kind, handler) {
        kind = getAbbrev(kind);
        this.e.addEventListener(kind, handler);
        return this;
    }
    h(content = "") {
        this.e.innerHTML = content;
        return this;
    }
    t(a, v) {
        a = getAbbrev(a);
        v = getAbbrev(v);
        this.e.setAttribute(a, v);
        return this;
    }
    rt(a) {
        a = getAbbrev(a);
        this.e.removeAttribute(a);
        return this;
    }
    bcr() {
        return this.e.getBoundingClientRect();
    }
    bcrt() { return this.bcr().top; }
    bcrl() { return this.bcr().left; }
}
e.l = {};
class Button extends e {
    constructor(caption = "", id = null) {
        super("input", id);
        this.t("type", "button");
        this.t("value", caption);
    }
    onClick(handler) {
        this.ae("md", handler);
        return this;
    }
}
class TextInput extends e {
    constructor(id = null) {
        super("input", id);
        this.t("type", "text");
    }
    setText(content) {
        this.e["value"] = content;
        return this;
    }
    getText() {
        return this.e["value"];
    }
}
class ComboOption extends e {
    constructor(key, display) {
        super("option");
        this.key = key;
        this.display = display;
        this.t("value", key).h(this.display);
    }
}
class ComboBox extends e {
    constructor(id = null) {
        super("select", id);
        this.options = [];
        this.selectedIndex = -1;
    }
    clear() {
        this.options = [];
        this.selectedIndex = -1;
        return this;
    }
    addOptions(os) {
        os.map(o => this.options.push(o));
        return this;
    }
    selectByIndex(index) {
        this.selectedIndex = index;
        this.selectedKey = this.options[this.selectedIndex].key;
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].rt("selected");
            if (i == this.selectedIndex) {
                this.options[i].t("selected", "true");
            }
        }
    }
    indexByKey(key) {
        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].key == key)
                return i;
        }
        return -1;
    }
    selectByKey(key) {
        this.selectByIndex(this.indexByKey(key));
    }
    build() {
        this.h("").a(this.options);
        return this;
    }
    change(e) {
        let t = e.target;
        this.selectedKey = t.selectedOptions[0].value;
        this.selectedIndex = this.indexByKey(this.selectedKey);
        if (this.changeHandler != undefined)
            this.changeHandler(e);
    }
    onChange(handler) {
        this.changeHandler = handler;
        this.ae("change", this.change.bind(this));
        return this;
    }
}
class FileView extends e {
    constructor(file, ld, ldi) {
        super("div");
        this.file = file;
        this.ld = ld;
        this.ldi = ldi;
    }
    closeClicked(e) {
        this.ld.closeLayer(this.ldi);
    }
    ajaxok() {
        let resjson = this.ajaxasset.resjson;
        let content = resjson.content;
        this.contentdiv.h(content);
    }
    ajaxfailed() {
    }
    loadFile() {
        this.ajaxasset = new AjaxAsset({
            action: "readtextfile",
            path: this.file.abspath
        });
        new AssetLoader().
            add(this.ajaxasset).
            setcallback(this.ajaxok.bind(this)).
            seterrorcallback(this.ajaxfailed.bind(this)).
            load();
    }
    build() {
        this.h("").pa().r(50, 50, 620, 450).s("bc", "#dfd").a([
            new Button("Close").onClick(this.closeClicked.bind(this)).px("mgt", 5).px("mgl", 10),
            new e("br"),
            this.contentdiv = new e("ta").px("mgl", 10).px("mgt", 5).z(600, 400)
        ]);
        this.layer = this.ld.openLayer(this.ldi);
        this.layer.a([this]);
        this.loadFile();
        return this;
    }
}
class DragDiv extends e {
    constructor() {
        super("div");
        this.LARGETOPBAR_PADDING = 100;
        this.MIN_TOP = 0;
        this.MIN_LEFT = 0;
        this.MAX_TOP = 400;
        this.MAX_LEFT = 1000;
        this.width = 200;
        this.height = 50;
        this.left = 0;
        this.top = 0;
        this.dragunderway = false;
        this.moveDiv = false;
    }
    limitTop(t) { return limit(t, this.MIN_TOP - this.computedTop, this.MAX_TOP - this.computedTop); }
    limitLeft(l) { return limit(l, this.MIN_LEFT - this.computedLeft, this.MAX_LEFT - this.computedLeft); }
    setTop(top) { this.top = top; return this; }
    setLeft(left) { this.left = left; return this; }
    setWidth(width) { this.width = width; return this; }
    setHeight(height) { this.height = height; return this; }
    setLargeTopBar(largetopbar) { this.largetopbar = largetopbar; return this; }
    setMouseMoveCallback(mouseMoveCallback) { this.mouseMoveCallback = mouseMoveCallback; return this; }
    setMouseUpCallback(mouseUpCallback) { this.mouseUpCallback = mouseUpCallback; return this; }
    setMoveDiv(moveDiv) { this.moveDiv = moveDiv; return this; }
    limitedDragd() {
        return this.dragd;
    }
    windowdragstart(e) {
        e.preventDefault();
        let me = e;
        this.dragstart = new Vectors.ScreenVector(me.clientX, me.clientY);
        this.dragunderway = true;
        this.largetopbar.z(2 * this.LARGETOPBAR_PADDING + this.width, 2 * this.LARGETOPBAR_PADDING + this.height);
        this.computedTop = this.bcrt();
        this.computedLeft = this.bcrl();
    }
    windowmouseout(e) {
        this.windowmousemove(e);
        this.windowmouseup(null);
        this.dragunderway = false;
    }
    windowmousemove(e) {
        let me = e;
        if (this.dragunderway) {
            this.dragd = new Vectors.ScreenVector(me.clientX, me.clientY).Minus(this.dragstart);
            let ldd = this.limitedDragd();
            if (this.mouseMoveCallback != undefined) {
                this.mouseMoveCallback(ldd);
            }
            if (this.moveDiv) {
                this.o(this.left + ldd.x, this.top + ldd.y);
            }
        }
    }
    windowmouseup(e) {
        if (this.dragunderway) {
            this.dragunderway = false;
            this.largetopbar.z();
            let ldd = this.limitedDragd();
            if (this.mouseUpCallback != undefined) {
                this.mouseUpCallback(ldd);
            }
            if (this.moveDiv) {
                this.top = this.top + ldd.y;
                this.left = this.left + ldd.x;
                this.o(this.left, this.top);
            }
        }
    }
    build() {
        this.r(this.left, this.top, this.width, this.height).
            t("dr", "true").pa().s("cur", "mv").
            ae("dragstart", this.windowdragstart.bind(this));
        this.largetopbar.pa().s("bc", "#00f").n("op", 0.0).
            o(-this.LARGETOPBAR_PADDING, -this.LARGETOPBAR_PADDING).z().
            ae("mm", this.windowmousemove.bind(this)).
            ae("mo", this.windowmouseout.bind(this)).
            ae("mu", this.windowmouseup.bind(this));
        return this;
    }
}
class SortableGridKey extends e {
    constructor(key, parent, sortfunc = Misc.defaultSortFunc) {
        super("table", parent.id + "_" + key);
        this.index = 0;
        this.direction = 1;
        this.key = key;
        this.parent = parent;
        this.sortfunc = sortfunc;
        this.fromStored();
    }
    toJson() {
        return {
            index: this.index,
            direction: this.direction
        };
    }
    fromJson(json) {
        this.index = json.index || 0;
        this.direction = json.direction || 1;
    }
    toJsonText() {
        return JSON.stringify(this.toJson());
    }
    sortPressed(direction, e) {
        this.direction = direction;
        this.build();
        this.store();
        this.parent.build();
    }
    build() {
        let tr = new e("tr");
        if (this.index > 0)
            tr.a([new e("td").a([new Button("<").onClick(this.parent.moveColumn.bind(this.parent, this, -1))])]);
        if (this.index < (this.parent.keys.length - 1))
            tr.a([new e("td").a([new Button(">").onClick(this.parent.moveColumn.bind(this.parent, this, 1))])]);
        this.px("bs", 1).s("bcs", "separate").h("").a([tr.a([
                new e("td").h(this.key),
                new e("td").a([
                    new Button("a").onClick(this.sortPressed.bind(this, 1)).
                        s("bc", this.direction == 1 ? SortableGridKey.SEL_BCOL : SortableGridKey.UNSEL_BCOL)
                ]),
                new e("td").a([
                    new Button("d").onClick(this.sortPressed.bind(this, -1)).
                        s("bc", this.direction == -1 ? SortableGridKey.SEL_BCOL : SortableGridKey.UNSEL_BCOL)
                ])
            ])]);
        this.store();
        return this;
    }
}
SortableGridKey.SEL_BCOL = "#0f0";
SortableGridKey.UNSEL_BCOL = "#eee";
class SortableGridIndex {
    constructor(row, key) {
        this.row = row;
        this.key = key;
    }
    hash() { return `${this.row},${this.key}`; }
}
class SortableGrid extends e {
    constructor(id) {
        super("table", id);
        this.keys = [];
        this.items = {};
        this.maxrow = 0;
        this.numFixed = 0;
    }
    clearItems() { this.items = {}; }
    setItem(sgi, e) {
        this.items[sgi.hash()] = e;
        if (sgi.row > this.maxrow)
            this.maxrow = sgi.row;
    }
    getItem(sgi) { return this.items[sgi.hash()]; }
    moveColumn(key, direction) {
        let index = this.keys.indexOf(key);
        if (index < 0)
            return; // invalid key
        let before = this.keys.slice(0, index);
        let beforelast = before.pop();
        let after = this.keys.slice(index + 1);
        let afterfirst = after.shift();
        let result = this.keys;
        if ((direction == -1) && (beforelast != undefined)) {
            result = [...before, key, beforelast, afterfirst, ...after];
        }
        if ((direction == 1) && (afterfirst != undefined)) {
            result = [...before, beforelast, afterfirst, key, ...after];
        }
        result = result.filter(key => key != undefined);
        this.keys = result;
        this.build();
    }
    sort() {
        let indices = [];
        for (let row = this.numFixed; row <= this.maxrow; row++) {
            indices.push(row);
        }
        indices.sort((ia, ib) => {
            for (let key of this.keys) {
                let a = this.getItem(new SortableGridIndex(ia, key.key)).key;
                let b = this.getItem(new SortableGridIndex(ib, key.key)).key;
                let cmp = key.sortfunc(a, b);
                if (cmp != 0) {
                    let ecmp = cmp * key.direction;
                    return ecmp;
                }
            }
            return 0;
        });
        for (let i = this.numFixed - 1; i >= 0; i--)
            indices.unshift(i);
        let newitems = {};
        for (let row = 0; row <= this.maxrow; row++) {
            for (let key of this.keys) {
                newitems[new SortableGridIndex(row, key.key).hash()] =
                    this.items[new SortableGridIndex(indices[row], key.key).hash()];
            }
        }
        this.items = newitems;
    }
    setKeys(keys) {
        this.keys = keys;
        this.sortKeys();
        return this;
    }
    setNumFixed(numFixed) { this.numFixed = numFixed; return this; }
    sortKeys() {
        this.keys.sort((a, b) => (a.index - b.index));
    }
    markRow(row, kind = "mark") {
        if (row < 0)
            return;
        switch (kind) {
            case "mark":
                this.tablerows[row].s("bc", "0f0");
                break;
            case "unmark":
                this.tablerows[row].s("bc", "initial");
                break;
        }
    }
    unMarkAllRows() {
        for (let row = 0; row <= this.maxrow; row++) {
            this.markRow(row, "unmark");
        }
    }
    getRowByColValue(key, value) {
        for (let row = 0; row <= this.maxrow; row++) {
            let item = this.getItem(new SortableGridIndex(row, key));
            if (item.key == value)
                return row;
        }
        return -1;
    }
    build() {
        this.sort();
        this.px("bs", 5).s("bcs", "separate").h("").a([new e("tr").a(this.keys.map(key => new e("td").a([key.build()])))]);
        this.tablerows = [];
        for (let row = 0; row <= this.maxrow; row++) {
            this.a([this.tablerows[row] = new e("tr").a(this.keys.map(key => {
                    let item = this.getItem(new SortableGridIndex(row, key.key));
                    let x = item == undefined ? new e("div").h("") : item;
                    return new e("td").a([x]);
                }))]);
        }
        for (let index = 0; index < this.keys.length; index++) {
            this.keys[index].index = index;
            this.keys[index].build();
        }
        return this;
    }
}
class LayeredDocument extends e {
    constructor(id) {
        super("div", id);
        this.MAX_LAYERS = 10;
        this.layers = [];
    }
    build() {
        this.h().pr().
            a([
            this.root = new e("div").pr(),
            this.layersRoot = new e("div").pa().o()
        ]);
        for (let i = 0; i < this.MAX_LAYERS; i++) {
            this.layers.push(new e("div").pa().o());
        }
        this.layersRoot.a(this.layers);
        return this;
    }
    openLayer(i) {
        let layer = this.layers[i];
        let w = window.innerWidth;
        let h = window.innerHeight;
        let layershadowdiv = new e("div").pa().o().z(w, h).
            s("bc", "#aaa").n("op", 0.5);
        let layerdiv = new e("div").pa();
        layer.h().a([
            layershadowdiv,
            layerdiv
        ]);
        return layerdiv;
    }
    closeLayer(i) {
        this.layers[i].h().px("w", 0).px("h", 0);
    }
}
var Globals;
(function (Globals) {
    Globals.ld = new LayeredDocument("maindoc").build();
})(Globals || (Globals = {}));
let FILE_SEPARATOR = "/";
class FileChooserState extends JsonSerializable {
    constructor(id) {
        super(id);
        this.drive = "C:";
        this.dirpathl = [];
        this.name = "default";
    }
    dirpath() { return this.dirpathl.join(FILE_SEPARATOR); }
    fullpath() { return [this.drive, ...this.dirpathl].join(FILE_SEPARATOR); }
    abspath(name = this.name) { return [this.fullpath(), name].join(FILE_SEPARATOR); }
    fromJson(json) {
        this.drive = json.drive;
        this.dirpathl = json.dirpathl;
        this.name = json.name;
    }
}
class DraggableWindow extends e {
    constructor(id, ld, ldi) {
        super("div", id);
        this.BAR_WIDTH = 30;
        this.BOTTOM_BAR_WIDTH = 40;
        this.PADDING = 5;
        this.DEFAULT_WIDTH = 400;
        this.DEFAULT_HEIGHT = 300;
        this.top = 0;
        this.left = 0;
        this.widgetHeight = 0;
        this.title = "";
        this.buttons = [
            ["Cancel", this.cancel]
        ];
        this.DRAG_SIZE_DIV_WIDTH = 30;
        this.ld = ld;
        this.ldi = ldi;
        this.setDefaultSize();
        this.fromStored();
        ld.openLayer(ldi).a([this]);
    }
    setDefaultSize() {
        this.width = this.DEFAULT_WIDTH;
        this.height = this.DEFAULT_HEIGHT;
    }
    setWidgetHeight(widgetHeight) {
        this.widgetHeight = widgetHeight;
        return this;
    }
    setTitle(title) {
        this.title = title;
        return this;
    }
    setWidth(width) { this.width = width; return this; }
    setHeight(height) { this.height = height; return this; }
    adjustMiddle() {
        this.left = (window.innerWidth - this.totalWidth()) / 2;
        this.top = (window.innerHeight - this.totalHeight()) / 2;
    }
    dragMouseMoveCallback(dragd) {
        this.o(this.left + dragd.x, this.top + dragd.y);
    }
    dragMouseUpCallback(dragd) {
        this.left = this.left + dragd.x;
        this.top = this.top + dragd.y;
        this.o(this.left, this.top);
        this.store();
    }
    dragSizeMouseMoveCallback(dragd) {
    }
    dragSizeMouseUpCallback(dragd) {
        this.width += dragd.x;
        this.height += dragd.y;
        this.store();
        this.build();
    }
    build() {
        if (!this.hasStored()) {
            this.adjustMiddle();
        }
        this.pa().z(this.totalWidth(), this.totalHeight()).bu("wood.jpg");
        this.h().o(this.left, this.top).a([
            //////////////////////////////////////////////
            this.topbardiv = new DragDiv().
                setLeft(this.PADDING).setTop(this.PADDING).
                setWidth(this.width).setHeight(this.height).
                setMouseMoveCallback(this.dragMouseMoveCallback.bind(this)).
                setMouseUpCallback(this.dragMouseUpCallback.bind(this)).
                s("bc", "#dfd").a([
                //////////////////////////////////////////////
                new e("div").h(this.title).pa().o(this.PADDING, this.PADDING).
                    px("fs", this.BAR_WIDTH - 2 * this.PADDING),
                //////////////////////////////////////////////
                this.largetopbar = new e("div")
                //////////////////////////////////////////////
            ]),
            //////////////////////////////////////////////
            new e("div").pa().s("bc", "e8f").
                r(this.PADDING, this.BAR_WIDTH + 2 * this.PADDING, this.width, this.height).a([
                this.widgetdiv = new e("div").pa().
                    r(0, 0, this.width, this.widgetHeight).s("bc", "7ad"),
                this.contentdiv = new e("div").s("ovf", "scroll").pa().
                    r(0, this.widgetHeight, this.width, this.height - this.widgetHeight)
            ]),
            //////////////////////////////////////////////
            this.bottombardiv = new e("div").pa().s("bc", "#dfd").
                r(this.PADDING, this.BAR_WIDTH + this.height + 3 * this.PADDING, this.width, this.BOTTOM_BAR_WIDTH).a(
            //////////////////////////////////////////////
            this.buttons.map(bd => new Button(bd[0]).onClick(bd[1].bind(this)).
                px("mgl", this.PADDING).px("mgt", this.PADDING).
                px("h", this.BOTTOM_BAR_WIDTH - 2 * this.PADDING))
            //////////////////////////////////////////////                    
            )
            //////////////////////////////////////////////
        ]);
        this.bottombardiv.a([
            this.dragSizeDiv = new DragDiv().
                setLeft(this.width - this.DRAG_SIZE_DIV_WIDTH - this.PADDING).setTop(this.PADDING).
                setWidth(this.DRAG_SIZE_DIV_WIDTH).setHeight(this.BOTTOM_BAR_WIDTH - 2 * this.PADDING).
                setMouseMoveCallback(this.dragSizeMouseMoveCallback.bind(this)).
                setMouseUpCallback(this.dragSizeMouseUpCallback.bind(this)).
                setMoveDiv(true).
                s("bc", "#e96").a([
                //////////////////////////////////////////////
                this.dragSizeLargeTopBar = new e("div")
                //////////////////////////////////////////////
            ])
        ]);
        this.topbardiv.setLargeTopBar(this.largetopbar).build();
        this.dragSizeDiv.setLargeTopBar(this.dragSizeLargeTopBar).build();
        return this;
    }
    cancel() {
        this.ld.closeLayer(this.ldi);
    }
    totalHeight() { return this.BAR_WIDTH + this.height + this.BOTTOM_BAR_WIDTH + 4 * this.PADDING; }
    totalWidth() { return this.width + 2 * this.PADDING; }
    toJsonText() {
        return JSON.stringify(this, ["top", "left", "width", "height"], 1);
    }
    fromJson(json) {
        this.top = json.top || 0;
        this.left = json.left || 0;
        this.width = json.width || this.DEFAULT_WIDTH;
        this.height = json.height || this.DEFAULT_HEIGHT;
    }
}
class FileDialogWindow extends DraggableWindow {
    setDefaultSize() {
        super.setDefaultSize();
        this.DEFAULT_WIDTH = 800;
        this.width = this.DEFAULT_WIDTH;
    }
    selectDirectory() {
        this.cancel();
        this.parent.directorySelected(this.fcs);
    }
    createDirOk() {
        this.build();
    }
    createDirFailed() {
    }
    dirDialogOk() {
        let dirname = this.dirdialogwindow.content;
        let dirpath = this.fcs.abspath("");
        let createdirasset = new AjaxAsset({
            action: "createdir",
            path: dirpath,
            name: dirname
        });
        this.markedpath = undefined;
        new AssetLoader().
            add(createdirasset).
            setcallback(this.createDirOk.bind(this)).
            seterrorcallback(this.createDirFailed.bind(this)).
            load();
    }
    renameDirOk() {
        this.build();
    }
    renameDirFailed() {
    }
    renamedirDialogOk() {
        let dirname = this.dirdialogwindow.content;
        let currentdirname = this.upDir();
        if (currentdirname == undefined)
            return;
        let dirpath = this.fcs.abspath(currentdirname);
        let newdirpath = this.fcs.abspath(dirname);
        let renamedirasset = new AjaxAsset({
            action: "renamefile",
            pathFrom: dirpath,
            pathTo: newdirpath
        });
        this.markedpath = undefined;
        new AssetLoader().
            add(renamedirasset).
            setcallback(this.renameDirOk.bind(this)).
            seterrorcallback(this.renameDirFailed.bind(this)).
            load();
    }
    createDirectory() {
        this.dirdialogwindow = new TextDialogWindow(this.dirdialogId(), this.ld, this.ldi + 1);
        this.dirdialogwindow.
            setOkCallBack(this.dirDialogOk.bind(this)).
            setTitle("Enter directory name").
            build();
    }
    createFileOk() {
        let name = this.dirdialogwindow.content;
        let createpath = this.fcs.abspath(name);
        let createasset = new AjaxAsset({
            action: "writetextfile",
            path: createpath,
            content: ""
        });
        new AssetLoader().
            add(createasset).
            setcallback(this.createOk.bind(this)).
            seterrorcallback(this.createFailed.bind(this)).
            load();
    }
    createOk() {
        this.build();
    }
    createFailed() {
    }
    createFile() {
        this.dirdialogwindow = new TextDialogWindow(this.dirdialogId(), this.ld, this.ldi + 1);
        this.dirdialogwindow.
            setOkCallBack(this.createFileOk.bind(this)).
            setTitle("Enter file name").
            build();
    }
    renameDirectory() {
        this.dirdialogwindow = new TextDialogWindow(this.dirdialogId(), this.ld, this.ldi + 1);
        this.dirdialogwindow.
            setOkCallBack(this.renamedirDialogOk.bind(this)).
            setTitle("Enter directory name").
            build();
    }
    removeDirOk() {
        this.build();
    }
    removeDirFailed() {
    }
    deleteDirectory() {
        let dirname;
        if ((dirname = this.upDir()) != undefined) {
            let dirpath = this.fcs.abspath("");
            let removedirasset = new AjaxAsset({
                action: "removedir",
                path: dirpath,
                name: dirname
            });
            this.markedpath = undefined;
            new AssetLoader().
                add(removedirasset).
                setcallback(this.removeDirOk.bind(this)).
                seterrorcallback(this.removeDirFailed.bind(this)).
                load();
        }
    }
    upDir() {
        if (this.fcs.dirpathl.length == 0)
            return undefined;
        return this.fcs.dirpathl.pop();
    }
    fileNameClicked(file, e) {
        if (file.name == "..") {
            if (this.upDir() != undefined)
                this.build();
        }
        else if (file.isdir) {
            this.fcs.dirpathl.push(file.name);
            this.build();
        }
        else if (file.isfile) {
            this.fcs.name = file.name;
            this.cancel();
            this.parent.directorySelected(this.fcs);
        }
    }
    toolSelected(file, tc, ev) {
        let name = file.name;
        let abspath = this.fcs.abspath(name);
        file.abspath = abspath;
        let command = tc.selectedKey;
        tc.build().selectByIndex(0);
        switch (command) {
            case "view":
                new FileView(file, this.ld, this.ldi + 1).build();
                break;
            case "edit":
                new FileView(file, this.ld, this.ldi + 1).build();
                break;
            case "copy":
            case "copyas":
            case "cut":
            case "cutas":
            case "rename":
                {
                    this.markedpath = abspath;
                    this.markedname = name;
                    this.showMarkedPath();
                    let row = this.filegrid.getRowByColValue("name", name);
                    this.filegrid.unMarkAllRows();
                    this.filegrid.markRow(row);
                    this.markedaction = "copy";
                    if ((command == "cut") || (command == "cutas"))
                        this.markedaction = "cut";
                    if (command == "rename")
                        this.markedaction = "rename";
                    if ((command == "copyas") || (command == "cutas") || (command == "rename")) {
                        this.namedialogwindow = new TextDialogWindow(this.namedialogId(), this.ld, this.ldi + 1);
                        this.namedialogwindow.
                            setOkCallBack(this.nameDialogOk.bind(this)).
                            setTitle("Enter file name").
                            build();
                    }
                }
                ;
                break;
            case "delete": {
                new ConfirmDialogWindow(this.deleteConfirmDialogId(), this.ld, this.ldi + 1).
                    setOkCallBack(this.deleteConfirmOk.bind(this)).
                    setContentInfo(`Are you sure you want to delete ${abspath}?`).
                    setTitle("Confirm delete").
                    build();
                this.deletepath = abspath;
            }
        }
    }
    deleteConfirmOk() {
        this.deleteFile(this.deletepath);
    }
    deleteConfirmDialogId() { return this.id + "_deleteconfirm"; }
    deleteFile(path) {
        let deleteasset = new AjaxAsset({
            action: "deletefile",
            path: path
        });
        this.markedpath = undefined;
        new AssetLoader().
            add(deleteasset).
            setcallback(this.deleteOk.bind(this)).
            seterrorcallback(this.deleteFailed.bind(this)).
            load();
    }
    deleteOk() {
        this.build();
    }
    deleteFailed() {
    }
    nameDialogOk() {
        this.markedname = this.namedialogwindow.content;
        let pastepath = this.fcs.abspath(this.markedname);
        if (this.markedaction == "rename") {
            let pasteasset = new AjaxAsset({
                action: "renamefile",
                pathFrom: this.markedpath,
                pathTo: pastepath
            });
            this.markedpath = undefined;
            new AssetLoader().
                add(pasteasset).
                setcallback(this.pasteOk.bind(this)).
                seterrorcallback(this.pasteFailed.bind(this)).
                load();
        }
        else
            this.showMarkedPath();
    }
    namedialogId() { return this.id + "_namedialog"; }
    dirdialogId() { return this.id + "_dirdialog"; }
    showMarkedPath() {
        this.markedpathdiv.h("").a([
            new e("div").h(this.fcs.fullpath())
        ]);
        if (this.markedpath != undefined) {
            this.markedpathdiv.a([
                new Button("Paste").onClick(this.pasteClicked.bind(this)),
                new e("span").h((this.markedaction == "copy" ? "Copy" : "Cut") + " " + this.markedpath + " as " + this.markedname)
            ]);
        }
    }
    pasteClicked(e) {
        let pastepath = this.fcs.abspath(this.markedname);
        let pasteasset = new AjaxAsset({
            action: this.markedaction == "copy" ? "copyfile" : "movefile",
            pathFrom: this.markedpath,
            pathTo: pastepath
        });
        this.markedpath = undefined;
        new AssetLoader().
            add(pasteasset).
            setcallback(this.pasteOk.bind(this)).
            seterrorcallback(this.pasteFailed.bind(this)).
            load();
    }
    pasteOk() {
        this.build();
    }
    pasteFailed() {
    }
    ajaxok() {
        let json = this.ajaxasset.resjson;
        let files = json.files || [];
        files.unshift({
            ok: true,
            name: "..",
            isdir: true,
            isfile: false,
            parentdir: true,
            stats: {}
        });
        this.filegrid.clearItems();
        let row = 0;
        files.map(file => {
            file.isanydir = file.isdir || file.parentdir;
            file.istruedir = file.isdir && (!file.parentdir);
            let stats = file.stats;
            let kind = `${file.isdir ? "dir" : ""}${file.isfile ? "file" : ""}`;
            this.filegrid.setItem(new SortableGridIndex(row, "type"), new e("div").
                h(kind).k(kind));
            this.filegrid.setItem(new SortableGridIndex(row, "name"), new e("div").
                h(file.name).k(file.name).s("cur", "ptr").
                s("bc", file.istruedir ? "#ffa" : "initial").
                px("pd", 3).
                ae("md", this.fileNameClicked.bind(this, file)));
            let tc = new ComboBox().addOptions([
                new ComboOption("tools", "Tools"),
                new ComboOption("view", "View"),
                new ComboOption("edit", "Edit"),
                new ComboOption("rename", "Rename"),
                new ComboOption("copy", "Copy"),
                new ComboOption("copyas", "CopyAs"),
                new ComboOption("cut", "Cut"),
                new ComboOption("cutas", "CutAs"),
                new ComboOption("delete", "Delete")
            ]);
            tc.onChange(this.toolSelected.bind(this, file, tc)).
                build();
            if ((!file.parentdir) && (file.isfile))
                this.filegrid.setItem(new SortableGridIndex(row, "tools"), new e("div").
                    a([
                    tc
                ]));
            this.filegrid.setItem(new SortableGridIndex(row, "modified"), new e("div").
                h(stats.mtime).k(stats.mtime));
            this.filegrid.setItem(new SortableGridIndex(row, "size"), new e("div").
                h(file.isanydir ? "" : stats.size).k(stats.size).px("w", 80).
                s("text-align", "right"));
            row++;
        });
        this.filegrid.build();
    }
    ajaxfailed() {
        console.log("ajax failed");
    }
    listFiles() {
        let path = this.fcs.abspath("");
        this.ajaxasset = new AjaxAsset({
            action: "listdir",
            path: path
        });
        new AssetLoader().
            add(this.ajaxasset).
            setcallback(this.ajaxok.bind(this)).
            seterrorcallback(this.ajaxfailed.bind(this)).
            load();
    }
    sortableGridId() { return this.id + "_grid"; }
    build() {
        this.setWidgetHeight(45);
        super.build();
        this.filegrid = new SortableGrid(this.sortableGridId());
        this.keys = [
            new SortableGridKey("type", this.filegrid),
            new SortableGridKey("name", this.filegrid),
            new SortableGridKey("tools", this.filegrid),
            new SortableGridKey("modified", this.filegrid),
            new SortableGridKey("size", this.filegrid)
        ];
        this.filegrid.setKeys(this.keys).setNumFixed(1).build();
        this.contentdiv.a([
            this.filegrid
        ]);
        this.markedpathdiv = this.widgetdiv;
        this.showMarkedPath();
        this.listFiles();
        return this;
    }
    constructor(id, ld, i, fcs, parent) {
        super(id, ld, i);
        this.fcs = fcs;
        this.parent = parent;
        this.buttons.push(["Select Directory", this.selectDirectory.bind(this)]);
        this.buttons.push(["Create Directory", this.createDirectory.bind(this)]);
        this.buttons.push(["Create File", this.createFile.bind(this)]);
        this.buttons.push(["Rename Directory", this.renameDirectory.bind(this)]);
        this.buttons.push(["Delete Directory", this.deleteDirectory.bind(this)]);
    }
}
class TextDialogWindow extends DraggableWindow {
    constructor(id, ld, i) {
        super(id, ld, i);
        this.content = "";
        this.textinput = new TextInput(this.textInputId());
        this.buttons.push(["Ok", this.okClicked.bind(this)]);
    }
    build() {
        this.height = 100;
        super.build();
        this.textinput.px("mgt", 10).px("mgl", 10);
        this.contentdiv.h("").a([
            this.textinput
        ]);
        setTimeout(((e) => {
            this.textinput.focus();
        }).bind(this), 100);
        return this;
    }
    okClicked(e) {
        this.content = this.textinput.getText();
        this.ld.closeLayer(this.ldi);
        if (this.okcallback != undefined)
            this.okcallback();
    }
    setText(content) {
        this.textinput.setText(content);
        return this;
    }
    textInputId() { return this.id + "_textinput"; }
    setOkCallBack(okcallback) {
        this.okcallback = okcallback;
        return this;
    }
}
class ConfirmDialogWindow extends DraggableWindow {
    build() {
        this.height = 100;
        super.build();
        this.contentdiv.h("").a([
            new e("div").h(this.contentinfo).px("mg", 10)
        ]);
        return this;
    }
    okClicked(e) {
        this.ld.closeLayer(this.ldi);
        if (this.okcallback != undefined)
            this.okcallback();
    }
    setContentInfo(contentinfo) {
        this.contentinfo = contentinfo;
        return this;
    }
    setOkCallBack(okcallback) {
        this.okcallback = okcallback;
        return this;
    }
    constructor(id, ld, i) {
        super(id, ld, i);
        this.buttons.push(["Ok", this.okClicked.bind(this)]);
    }
}
class FileChooser extends e {
    constructor(id) {
        super("table", id);
        this.state = new FileChooserState(this.fileChooserStateId());
        this.state.fromStored();
    }
    fileChooserStateId() { return this.id + "_state"; }
    driveButtonId() { return this.id + "_drive"; }
    nameInputId() { return this.id + "_name"; }
    driveButtonClicked() {
    }
    directorySelected(fcs) {
        this.state = fcs;
        this.build();
    }
    selectButtonClicked() {
        let cstate = new FileChooserState(this.fileChooserStateId());
        cstate.copyFrom(this.state);
        new FileDialogWindow("File", Globals.ld, 5, cstate, this).
            setTitle("Select file / directory").
            build();
    }
    build() {
        this.px("bs", 5).s("bcs", "separate").h().a([
            new e("tr").a([
                new e("td").a([
                    new Button(this.state.drive).onClick(this.driveButtonClicked.bind(this))
                ]),
                new e("td").a([
                    new e("lb").s("ff", "ms").h(this.state.fullpath())
                ]),
                new e("td").a([
                    new Button("...").onClick(this.selectButtonClicked.bind(this))
                ]),
                new e("td").a([
                    new TextInput(this.nameInputId()).setText(this.state.name)
                ])
            ])
        ]);
        this.state.store();
        return this;
    }
}
var Physics;
(function (Physics) {
    Physics.G = 6.674E-11;
    Physics.Me = 5.972E24;
    Physics.Re = 6.371E6;
    function Fg(m1, m2, r) {
        return Physics.G * m1 * m2 / (r * r);
    }
    Physics.Fg = Fg;
    function Fge(m, r) {
        return Physics.G * m * Physics.Me / (r * r);
    }
    Physics.Fge = Fge;
    class Vector {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        plus(v) {
            return new Vector(this.x + v.x, this.y + v.y);
        }
        minus(v) {
            return new Vector(this.x - v.x, this.y - v.y);
        }
        l() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        s(s) {
            return new Vector(this.x * s, this.y * s);
        }
    }
    Physics.Vector = Vector;
})(Physics || (Physics = {}));
class DrawCircle {
    constructor(x, y, r, fill, stroke) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.fill = fill;
        this.stroke = stroke;
    }
}
class RocketCalculator extends e {
    constructor() {
        super("div");
        this.m = 1000;
        this.x = 0;
        this.y = Physics.Re;
        this.vx = 605;
        this.vy = 7310;
        this.ts = 1;
        this.sts = 10;
        this.circles = [];
        this.simon = false;
        this.maxdist = 0;
        this.maxvabs = 0;
        this.GRAPH_WIDTH = 600;
        this.GRAPH_HEIGHT = 600;
        this.GRAPH_OFFSET_X = 200;
        this.GRAPH_OFFSET_Y = 300;
        this.SCALE_FACTOR = 1;
    }
    reset() {
        this.circles = [];
    }
    display() {
        this.mtext.setText("" + this.m);
        this.xtext.setText("" + this.x);
        this.ytext.setText("" + this.y);
        this.vxtext.setText("" + this.vx);
        this.vytext.setText("" + this.vy);
        this.tstext.setText("" + this.ts);
        this.ststext.setText("" + this.sts);
    }
    read() {
        this.m = parseFloat(this.mtext.getText());
        this.x = parseFloat(this.xtext.getText());
        this.y = parseFloat(this.ytext.getText());
        this.vx = parseFloat(this.vxtext.getText());
        this.vy = parseFloat(this.vytext.getText());
        this.ts = parseFloat(this.tstext.getText());
        this.sts = parseFloat(this.ststext.getText());
    }
    simulate() {
        this.simon = !this.simon;
        if (this.simon) {
            this.read();
            this.addCircle(0, 0, Physics.Re);
            this.drawsvg();
            this.stime = 0;
            this.maxdist = 0;
            this.maxvabs = 0;
            this.simulStep(null);
        }
    }
    GRAPH_SCALE() { return this.GRAPH_WIDTH / (4 * Physics.Re) * this.SCALE_FACTOR; }
    GRAPH_SCALE_X() { return this.GRAPH_SCALE(); }
    GRAPH_SCALE_Y() { return this.GRAPH_SCALE(); }
    x2sx(x) { return x * this.GRAPH_SCALE_X() + this.GRAPH_OFFSET_X; }
    y2sy(y) { return -y * this.GRAPH_SCALE_Y() + this.GRAPH_OFFSET_Y; }
    addCircle(x, y, r, fill = "#aaf", stroke = "#00f") {
        this.circles.push(new DrawCircle(x, y, r, fill, stroke));
    }
    circle(x, y, r, fill = "#aaf", stroke = "#00f") {
        this.svg.a([
            new e("circle").
                t("cx", "" + this.x2sx(x)).
                t("cy", "" + this.y2sy(y)).
                t("r", "" + r * this.GRAPH_SCALE()).
                t("fill", fill).
                t("stroke", stroke)
        ]);
    }
    drawsvg() {
        this.svg = new e("svg").
            t("width", "" + this.GRAPH_WIDTH).
            t("height", "" + this.GRAPH_HEIGHT);
        this.circles.map(dc => {
            this.circle(dc.x, dc.y, dc.r, dc.fill, dc.stroke);
        });
        this.svgdiv.h(`
        <svg width="${this.GRAPH_WIDTH}" height="${this.GRAPH_HEIGHT}">
            ${this.svg.e.innerHTML}
        </svg>
        `);
    }
    simulStep(ev) {
        let o = new Physics.Vector(this.x, this.y);
        if (o.l() < Physics.Re) {
            this.simon = false;
            return;
        }
        let v = new Physics.Vector(this.vx, this.vy);
        let l = o.l();
        let gfabs = -Physics.Fge(this.m, l);
        let gf = new Physics.Vector(o.x / l, o.y / l).s(gfabs);
        let a = gf.s(1 / this.m);
        let no = o.plus(v.s(this.ts));
        let nv = v.plus(a.s(this.ts));
        this.x = no.x;
        this.y = no.y;
        this.vx = nv.x;
        this.vy = nv.y;
        let dist = no.l() - Physics.Re;
        let vabs = nv.l();
        if (dist > this.maxdist)
            this.maxdist = dist;
        if (vabs > this.maxvabs)
            this.maxvabs = vabs;
        let travel = (Math.PI / 2 - Math.atan(no.y / no.x)) * Physics.Re;
        this.infodiv.h(`
<pre>
dist    :  ${(dist / 1000).toLocaleString()} km<br>
maxdist :  ${(this.maxdist / 1000).toLocaleString()} km<br>
vabs    :  ${vabs.toLocaleString()} m/s<br>
maxvabs :  ${this.maxvabs.toLocaleString()} m/s<br>
travel  :  ${(travel / 1000).toLocaleString()} km<br>            
time    :  ${this.stime} s<br>
</pre>
        `).px("w", 250).px("mg", 15);
        this.display();
        if (dist <= 0)
            this.simon = false;
        if (((this.stime % 50) == 0) || (!this.simon)) {
            this.addCircle(no.x, no.y, 150000, "#ff0", "#000");
            this.drawsvg();
        }
        this.stime += this.ts;
        if (this.simon) {
            this.simulbutton.e["value"] = "Stop simulation";
            setTimeout(this.simulStep.bind(this), this.sts);
        }
        else {
            this.simulbutton.e["value"] = "Simulate";
        }
    }
    build() {
        this.table = new e("table");
        this.mtext = new TextInput();
        this.xtext = new TextInput();
        this.ytext = new TextInput();
        this.vxtext = new TextInput();
        this.vytext = new TextInput();
        this.tstext = new TextInput();
        this.ststext = new TextInput();
        this.table.px("bs", 3).s("bcs", "separate").a([
            new e("tr").a([
                new e("td").a([new e("div").h("m")]),
                new e("td").a([this.mtext])
            ]),
            new e("tr").a([
                new e("td").a([new e("div").h("x")]),
                new e("td").a([this.xtext])
            ]),
            new e("tr").a([
                new e("td").a([new e("div").h("y")]),
                new e("td").a([this.ytext])
            ]),
            new e("tr").a([
                new e("td").a([new e("div").h("vx")]),
                new e("td").a([this.vxtext])
            ]),
            new e("tr").a([
                new e("td").a([new e("div").h("vy")]),
                new e("td").a([this.vytext])
            ]),
            new e("tr").a([
                new e("td").a([new e("div").h("ts")]),
                new e("td").a([this.tstext])
            ]),
            new e("tr").a([
                new e("td").a([new e("div").h("sts")]),
                new e("td").a([this.ststext])
            ]),
            new e("tr").a([
                new e("td").t("colspan", "2").a([
                    new Button("+").
                        onClick(this.zoom.bind(this, 1.2)).
                        px("mg", 10),
                    new Button("-").
                        onClick(this.zoom.bind(this, 0.8)).
                        px("mg", 10),
                    this.simulbutton = new Button("Simulate").
                        onClick(this.simulate.bind(this)).
                        px("mg", 10)
                ])
            ])
        ]);
        this.h("").a([
            new e("table").px("bs", 5).s("bcs", "separate").px("mg", 5).
                s("ff", "ms").a([
                new e("tr").a([
                    new e("td").s("vertical-align", "top").a([
                        this.table,
                        this.infodiv = new e("div").s("ff", "ms")
                    ]),
                    new e("td").a([
                        this.svgdiv = new e("div").
                            z(this.GRAPH_WIDTH, this.GRAPH_HEIGHT)
                    ])
                ])
            ])
        ]);
        this.display();
        return this;
    }
    zoom(factor, e) {
        this.SCALE_FACTOR *= factor;
        this.drawsvg();
    }
}
function main() {
    document.getElementById("scriptroot").appendChild(Globals.ld.e);
    Globals.ld.root.h().a([
        /*new FileChooser("fc").build(),*/
        new RocketCalculator().build()
    ]);
}
//localStorage.clear()
main();
