import { insideHitTestRectangle, measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";
import { SKEvent, SKMouseEvent } from "../events";

import { requestMouseFocus } from "../dispatch";

type SKToggleButtonProps = SKElementProps & {
    toggled?: boolean;
    dotFill?: string;
    toggleFill?: string;
    dotPadding?: number;
};

export class SKToggle extends SKElement {
  constructor({ 
    fill = "lightgrey",
    toggleFill = "#303030",
    dotFill = "#ffffff",
    dotPadding = 5,
    toggled = false,
    ...elementProps
  }: SKToggleButtonProps = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    this.fill = fill;
    this.dotFill = dotFill;
    this.toggleFill = toggleFill;
    this.calculateBasis();
    this.doLayout();
  }

  state: "idle" | "hover" | "down" = "idle";

  protected _dotPadding = 5;
  set dotPadding(dp: number){
    this._dotPadding = dp;
  }
  get dotPadding(){
    return this._dotPadding;
  }

  protected _toggle = false;
  set toggle(t: boolean){
    this._toggle = t;
  }
  get toggle(){
    return this._toggle;
  }

  protected _radius = 4;
  set radius(r: number) {
    this._radius = r;
  }
  get radius() {
    return this._radius;
  }

  protected _font = Style.font;
  set font(s: string) {
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font() {
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }

  protected _highlightColour = Style.highlightColour;
  set highlightColour(hc: string){
    this._highlightColour = hc;
  }

  protected _toggleFill = "#303030";
  set toggleFill(tf: string){
    this._toggleFill = tf;
  }
  get toggleFill(){
    return this._toggleFill;
  }

  protected _dotFill = "#ffffff";
  set dotFill(df: string){
    this._dotFill = df;
  }
  get dotFill(){
    return this._dotFill;
  }


  setMinimalSize(width?: number, height?: number) {
    width = width || this.width;
    height = height || this.height;
    // need this if w or h not specified



    this.height = height;

    this.width = width;
    // enforce a minimum width here (if no width specified)
    if (!width) this.width = Math.max(this.width!, 80);
  }

  handleMouseEvent(me: SKMouseEvent) {
    // console.log(`${this.text} ${me.type}`);

    switch (me.type) {
      case "mousedown":
        this.state = "down";
        requestMouseFocus(this);
        return true;
        break;
      case "mouseup":
        this.state = "hover";
        // return true if a listener was registered
        if (this.toggle){
          this.toggle = false;
          return this.sendEvent({
            source: this,
            timeStamp: me.timeStamp,
            type: "toggleOff",
          } as SKEvent);
        } 
        this.toggle = true;
        return this.sendEvent({
          source: this,
          timeStamp: me.timeStamp,
          type: "toggleOn",
        } as SKEvent);
        break;
      case "mouseenter":
        this.state = "hover";
        return true;
        break;
      case "mouseexit":
        this.state = "idle";
        return true;
        break;
    }
    return false;
  }

  draw(gc: CanvasRenderingContext2D) {
    // to save typing "this" so much

    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);

    // thick highlight rect
    if (this.state == "hover" || this.state == "down") {
      gc.beginPath();
      gc.roundRect(this.x, this.y, w, h, this.radius);
      gc.strokeStyle = this._highlightColour;
      gc.lineWidth = 8;
      gc.stroke();
    }

    let doty = this.y+this.dotPadding;
    let dotx = this.x+this.dotPadding;
    let currFill = this.toggleFill;

    if (this.toggle){
      dotx = this.x+w-h+this.dotPadding;
      currFill = this.fill;
    }
    
    // normal background
    gc.beginPath();
    gc.roundRect(this.x, this.y, w, h, this.radius);
    gc.fillStyle =
      this.state == "down" ? this._highlightColour : currFill;
    gc.strokeStyle = this.border;
    // change fill to show down state
    gc.lineWidth = this.state == "down" ? 4 : 2;
    gc.fillStyle = this.state == "down" ? this._highlightColour : currFill;
    gc.fill();
    gc.stroke();

    // Dot
    gc.beginPath();
    gc.roundRect(dotx, doty, h-2*this.dotPadding, h-2*this.dotPadding, this. radius);
    gc.fillStyle = this.dotFill;
    gc.fill();
    gc.stroke();
    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
  }

  public toString(): string {
    return `SKButton '${this.state}'`;
  }
}
