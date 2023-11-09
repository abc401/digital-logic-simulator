import { Scheduler } from "./scheduler.js";

export class Wire {
  producerCircuit: Circuit;
  producerPinNumber: number;
  consumerCircuit: Circuit;
  consumerPinNumber: number;
  scheduler: Scheduler;

  constructor(
    from: Circuit,
    fromPinNumber: number,
    to: Circuit,
    toPinNumber: number,
    scheduler: Scheduler
  ) {
    this.scheduler = scheduler;

    this.producerCircuit = from;
    this.producerPinNumber = fromPinNumber;
    from.producerPins[fromPinNumber].wires.push(this);

    this.consumerCircuit = to;
    this.consumerPinNumber = toPinNumber;
  }

  propogateValue(value: boolean) {
    let consumerPin = this.consumerCircuit.consumerPins[this.consumerPinNumber];
    if (value === consumerPin.value) {
      return;
    }
    consumerPin.value = value;

    this.scheduler.backEventBuffer.enqueue(this.consumerCircuit);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const fromX =
      this.producerCircuit.producerPins[this.producerPinNumber].pos_x;
    const fromY =
      this.producerCircuit.producerPins[this.producerPinNumber].pos_y;
    const toX = this.consumerCircuit.consumerPins[this.consumerPinNumber].pos_x;
    const toY = this.consumerCircuit.consumerPins[this.consumerPinNumber].pos_y;

    if (this.producerCircuit.producerPins[this.producerPinNumber].value) {
      ctx.strokeStyle = "blue";
    } else {
      ctx.strokeStyle = "black";
    }
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.closePath();
    ctx.stroke();
  }
}

class ConsumerPin {
  static radius = 10;
  circuit: Circuit;
  value: boolean;
  pos_x: number;
  pos_y: number;

  constructor(circuit: Circuit, pos_x: number, pos_y: number) {
    this.circuit = circuit;
    this.value = false;
    this.pos_x = pos_x;
    this.pos_y = pos_y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.pos_x, this.pos_y, ConsumerPin.radius, 0, 2 * Math.PI);
    if (this.value) {
      ctx.fillStyle = "red";
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

class ProducerPin {
  static radius = 10;
  wires: Wire[];
  value: boolean;
  pos_x: number;
  pos_y: number;

  constructor(pos_x: number, pos_y: number, value: boolean = false) {
    this.wires = [];
    this.value = value;
    this.pos_x = pos_x;
    this.pos_y = pos_y;
  }

  setValue(value: boolean) {
    if (this.value === value) {
      return;
    }

    this.value = value;
    for (let i = 0; i < this.wires.length; i++) {
      this.wires[i].propogateValue(value);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.pos_x, this.pos_y, ConsumerPin.radius, 0, 2 * Math.PI);
    if (this.value) {
      ctx.fillStyle = "red";
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

type CircuitUpdateHandeler = (self: Circuit) => void;

export class Circuit {
  static width = 100;
  pos_x: number;
  pos_y: number;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  update: CircuitUpdateHandeler;
  scheduler: Scheduler;

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    scheduler: Scheduler,
    pos_x: number = 0,
    pos_y: number = 0,
    update: undefined | CircuitUpdateHandeler = undefined,
    isInput: boolean = false
  ) {
    this.scheduler = scheduler;
    this.pos_x = pos_x;
    this.pos_y = pos_y;

    if (nConsumerPins % 1 !== 0) {
      throw Error(
        `Expected nConsumerPins to be integer but got: ${nConsumerPins}`
      );
    }
    if (nProducerPins % 1 !== 0) {
      throw Error(
        `Expected nProducerPins to be integer but got: ${nProducerPins}`
      );
    }

    this.consumerPins = Array(nConsumerPins);
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i] = new ConsumerPin(
        this,
        this.pos_x,
        this.pos_y + i * 70
      );
    }

    this.producerPins = Array(nProducerPins);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(
        this.pos_x + Circuit.width,
        this.pos_y + i * 70
      );
    }
    this.update = update || ((_self) => {});

    if (isInput) {
      scheduler.recurringEvents.push(this);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i].draw(ctx);
    }
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i].draw(ctx);
    }
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      this.pos_x,
      this.pos_y,
      Circuit.width,
      this.consumerPins.length > this.producerPins.length
        ? this.consumerPins.length * 70
        : this.producerPins.length * 70
    );
  }
}
