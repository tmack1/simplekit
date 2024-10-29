import { SKEvent } from "../events";
import { measureText } from "../utility";

import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";

type LabelAlign = "centre" | "left" | "right";

type SKTimerProps = SKElementProps & {
  duration?: number;
  align?: LabelAlign;
};

export class SKTimer extends SKElement {
  constructor({
    duration = 0,
    align = "centre",
    ...elementProps
  }: SKTimerProps = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    this.align = align;

    // defaults
    this.fill = "";
    this.border = "";
  }

  align: LabelAlign;

  protected _duration = 0;
  set duration(d: number){
    if (d > 599){
        this._duration = 599;
    } 
    else if(d<0){
        this._duration = 0;
    } 
    else {
        this._duration = d;
    }
    //When duration is changed, only update when timer is not running.
    if(!this._intervalId){
        this._time = this.formatTimer(this.duration);
    }
  }
  get duration(){
    return this._duration;
  }

  protected _currentTime = this.duration;
  private _intervalId: NodeJS.Timeout | null = null;

  protected _time = this.formatTimer(this.duration);
  get time() {
    return this._time;
  }
  private set time(t: string){
    this._time = t;
    this.setMinimalSize(this.width, this.height);
  } 
  /*
  set time(t: string) {
    this._time = t;
    this.setMinimalSize(this.width, this.height);
  }
  */

  protected _radius = 0;
  set radius(r: number){
    this._radius = r;
  }
  get radius(){
    return this._radius;
  }

  protected _font = Style.font;
  set font(s: string){
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font(){
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }

  private formatTimer(time: number){
    const minute = String(Math.floor(time/60)).padStart(2,'0');
    const seconds = String(time % 60).padStart(2,'0');
    return `${minute}:${seconds}`;
  }

  start(){
    this._currentTime = this.duration;
    if (this._intervalId === null){
        this._intervalId = setInterval(() => {
            if (this._currentTime > 0){
                this._currentTime--;
                this._time = this.formatTimer(this._currentTime);
            }
            else {this.stop();}
        }, 1000)
    }
  }

  private timerStop = false;

  public reset(){
    this.stop();
    this._currentTime = this.duration = 0;
  }

  public stop(){
    if (this._intervalId !== null){
        clearInterval(this._intervalId);
        this._intervalId = null;
        this.sendEvent({
            source: this,
            timeStamp: 0,
            type: "TimerFinshed",
        } as SKEvent);
    }
  }

  setMinimalSize(width?: number, height?: number) {
    // need this if w or h not specified
    const m = measureText(this.time || " ", this._font);

    if (!m) {
      console.warn(`measureText failed in SKLabel for ${this.time}`);
      return;
    }

    this.height = height || m.height + this.padding * 2;

    this.width = width || m.width + this.padding * 2;
  }

  draw(gc: CanvasRenderingContext2D) {
    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);

    if(this.fill){
      gc.beginPath();
      gc.roundRect(this.x, this.y, w, h, this._radius);
      gc.fillStyle =  this.fill;
      gc.fill();
    }
    
    if(this.border){
      gc.strokeStyle = this.border;
      gc.lineWidth = 1;
      gc.stroke();
    }
    
    // render text
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textBaseline = "middle";

    switch (this.align) {
      case "left":
        gc.textAlign = "left";
        gc.fillText(this.time, this.x + this.padding, this.y + h / 2);

        break;
      case "centre":
        gc.textAlign = "center";
        gc.fillText(this.time, this.x + w / 2, this.y + h / 2);

        break;
      case "right":
        gc.textAlign = "right";
        gc.fillText(this.time, this.x + w - this.padding, this.y + h / 2);

        break;
    }

    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
  }

  public toString(): string {
    return `SKLabel '${this.time}'`;
  }
}
