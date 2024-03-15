// ----- Connection element -----

class ConnectionElement extends HTMLElement {
    parent: HTMLElement;
    svg: SVGSVGElement;
    line: SVGLineElement;
    lineStyle: string = "stroke:rgb(192, 192, 192); stroke-width:2;"
    n1: NodeElement;
    n2: NodeElement;
    e1: HTMLElement;
    e2: HTMLElement;
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    constructor(n1: NodeElement, n2: NodeElement, svg: SVGSVGElement, e1: HTMLElement, e2: HTMLElement) {
        super();
        this.e1 = e1;
        this.e2 = e2;
        this.n1 = n1;
        this.n2 = n2;
        this.svg = svg;
        this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.svg.append(this.line);
    }

    connectedCallback() {
        this.parent = this.parentElement;
        this.svg.appendChild(this.line);
        this.render();
        this.n1.subscribe(this.observe.bind(this));
        this.n2.subscribe(this.observe.bind(this));
    }

    render() {
        let svgLeft = this.svg.getBoundingClientRect().left;
        let svgTop = this.svg.getBoundingClientRect().top;
        this.x1 = -svgLeft + this.e1.getBoundingClientRect().left + this.e1.offsetWidth / 2;
        this.x2 = -svgLeft + this.e2.getBoundingClientRect().left + this.e2.offsetWidth / 2;
        this.y1 = -svgTop + this.e1.getBoundingClientRect().top + this.e1.offsetHeight / 2;
        this.y2 = - svgTop + this.e2.getBoundingClientRect().top + this.e2.offsetHeight / 2;
        this.line.setAttribute("x1", this.x1.toString());
        this.line.setAttribute("y1", this.y1.toString());
        this.line.setAttribute("x2", this.x2.toString());
        this.line.setAttribute("y2", this.y2.toString()); 
        this.line.setAttribute("style", this.lineStyle);
    }

    observe(eventName: string, value: any) {
        if (eventName === "moved") { this.render(); }
    }
}

customElements.define("connection-element", ConnectionElement);



// ----- Node element -----

const nodeTemplate = document.createElement("template");
nodeTemplate.innerHTML = `
<style>
    .widget {
        width: 120px;
        position: absolute;
        background-color: #31363F;
        border: 1px solid #76ABAE;
    }

    .widget-header {
        user-select: none;
        color: #EEEEEE;
        text-align: center;
        padding: 4px;
        background-color: #222831;
        border-bottom: 1px solid #76ABAE;
    }

    .widget-body {
        padding: 8px;
    }

    .control {
        width: 65%;
        height: 20px;
        background-color: #222831;
        color: #EEEEEE;
        border: 1px solid #76ABAE;
        padding-left: 8px;
    }
    
    .connector {
        width: 20px;
        user-select: none;
        color: #EEEEEE;
        margin-left: 8px;
    }

    .result {
        color: #EEEEEE;
        margin-left: 8px;
        padding: 8px;
        padding-left: 8px;
        border: 1px solid #76ABAE;
        width: 100%;
    }

    .hstack {
        display: flex;
        flex-direction: row;
    }

    .vstack {
        display: flex;
        flex-direction: column;
    }
</style>
<div class="widget">
    <div class="widget-header">Widget</div>
    <div class="widget-body"></div>
</div>
`

class NodeElement extends HTMLElement {
    widget: HTMLElement;
    widgetHeader: HTMLElement;
    widgetBody: HTMLElement;
    parent: HTMLElement;
    editor: HTMLElement;
    svg: SVGSVGElement;
    subscribers: SubscriberType[];

    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.appendChild(nodeTemplate.content.cloneNode(true));

        this.widget = this.shadowRoot.querySelector(".widget") as HTMLElement;
        this.widgetHeader = this.shadowRoot.querySelector(".widget-header");
        this.widgetBody = this.shadowRoot.querySelector(".widget-body");

        this.subscribers = [];
    }

    moveWidget(x: number, y: number) {
        if (
            x > this.parent.getBoundingClientRect().left &&
            x < this.parent.getBoundingClientRect().right - this.widget.offsetWidth
        ) {
            this.widget.style.left = x + "px";
        }

        if (
            y > this.parent.getBoundingClientRect().top &&
            y < this.parent.getBoundingClientRect().bottom - this.widget.offsetHeight
        ) {
            this.widget.style.top = y + "px";
        }

        this.notifySubscribers("moved", {x, y});
    }

    connectedCallback() {
        this.parent = this.parentElement;
        this.svg = this.parent.querySelector("svg");

        this.widgetHeader.addEventListener("mousedown", (e) => {
            const shiftX = e.clientX - this.widgetHeader.getBoundingClientRect().left;
            const shiftY = e.clientY - this.widgetHeader.getBoundingClientRect().top;

            this.widget.style.position = "absolute";
            this.widget.style.zIndex = "1000";

            function onMouseMove(e: MouseEvent) {
                let x = e.pageX - shiftX;
                let y = e.pageY - shiftY;
                this.moveWidget(x, y);
            }

            const boundOnMouseMove = onMouseMove.bind(this);
            document.addEventListener("mousemove", boundOnMouseMove);

            function onMouseUp(e: MouseEvent) {
                document.removeEventListener("mousemove", boundOnMouseMove);
                this.widget.onmouseup = null;
            }

            const boundOnMouseUp = onMouseUp.bind(this);
            document.addEventListener("mouseup", boundOnMouseUp);
        });
    }

    notifySubscribers(eventName: string, value: any) {
        if (!this.subscribers) { return; }
        this.subscribers.forEach(subscriber => {
            subscriber(eventName, value);
        });
    }

    subscribe(subscriber: SubscriberType) {
        this.subscribers.push(subscriber);
    }
}

customElements.define("node-element", NodeElement);



// ----- Num node -----
type SubscriberType = (eventName: string, value: any) => void

class NumNode extends NodeElement {
    
    num: number;
    numConn: HTMLElement;
 
    constructor() {
        super();
        this.num = 12;
        this.subscribers = [];
        this.widgetHeader.textContent = "Number";
        this.widgetBody.innerHTML = `
            <input type="number" id="num" value="${this.num}" class="control"/>
            <span id="num-connector" class="connector">o</span>
        `
        this.numConn = this.shadowRoot.querySelector("#num-connector");
        this.widgetBody.querySelector("#num").addEventListener("input", this.numChanged.bind(this));
    }

    numChanged(e: Event) {
        this.num = parseInt((e.target as HTMLInputElement).value);
        this.notifySubscribers("num-changed", this.num);
    }

    getNumConn() {
        return this.numConn;
    }
}

customElements.define("num-node", NumNode);



// ----- Sum node -----

class SumNode extends NodeElement {
    sum: number | "";
    a: NumNode;
    b: NumNode;
    aConn: ConnectionElement;
    bConn: ConnectionElement;

    constructor() {
        super();
        this.sum = "";
        this.widgetHeader.textContent = "Sum";
        this.widgetBody.innerHTML = `
        <div class="hstack">
            <div class="vstack">
                <span id="connector1" class="connector">o</span>
                <span id="connector2" class="connector">o</span>
            </div>
            <div id="sum" class="result">${this.sum}</div>
        </div>
        `
        this.aConn = this.shadowRoot.querySelector("#connector1");
        this.bConn = this.shadowRoot.querySelector("#connector2");
    }

    calculateSum() {
        if (this.a && this.b) {
            this.sum = (this.a as NumNode).num + (this.b as NumNode).num;
            this.widgetBody.querySelector("#sum").textContent = this.sum.toString();
        }
    }

    observe(eventName: string, value: any) {
        if (eventName === "num-changed") { this.calculateSum(); }
    }

    setA (a: NumNode) {
        this.a = a as NumNode;
        this.aConn = new ConnectionElement(this, a, this.svg, this.aConn, a.getNumConn());
        this.parent.appendChild(this.aConn);
        this.calculateSum();
        this.a.subscribe(this.observe.bind(this));
    }

    setB (b: NumNode) {
        this.b = b;
        this.bConn = new ConnectionElement(this, b, this.svg, this.bConn, b.getNumConn());
        this.parent.appendChild(this.bConn);
        this.calculateSum();
        this.b.subscribe(this.observe.bind(this));
    }
}

customElements.define("sum-node", SumNode);