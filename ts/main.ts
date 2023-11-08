class Wire {
  producerCircuit: Circuit;
  producerPinNumber: number;
  consumerCircuit: Circuit;
  consumerPinNumber: number;

  constructor(
    from: Circuit,
    fromPinNumber: number,
    to: Circuit,
    toPinNumber: number
  ) {
    this.producerCircuit = from;
    this.producerPinNumber = fromPinNumber;
    from.producerPins[fromPinNumber].wires.push(this);

    this.consumerCircuit = to;
    this.consumerPinNumber = toPinNumber;
  }

  propogateValue(value: boolean) {
    this.consumerCircuit.consumerPins[this.consumerPinNumber].consumeValue(
      value
    );
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

  consumeValue(value: boolean) {
    this.value = value;
    this.circuit.func(this.circuit);
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

enum CircuitRunMethod {
  OnInputChange,
  Interval,
}

class Circuit {
  static width = 100;
  pos_x: number;
  pos_y: number;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  func: (self: Circuit) => void;

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    pos_x: number = 0,
    pos_y: number = 0,
    runMethod: CircuitRunMethod = CircuitRunMethod.OnInputChange,
    func: undefined | ((self: Circuit) => void) = undefined
  ) {
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
    this.func = func || ((_self) => {});

    if (runMethod === CircuitRunMethod.Interval && this.func != null) {
      setInterval(() => {
        this.func(this);
      }, 1000);
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

const Clock1 = new Circuit(0, 1, 30, 30, CircuitRunMethod.Interval, (self) => {
  self.producerPins[0].setValue(!self.producerPins[0].value);
});

const Or = new Circuit(
  2,
  1,
  300,
  30,
  CircuitRunMethod.OnInputChange,
  (self) => {
    self.producerPins[0].setValue(
      self.consumerPins[0].value || self.consumerPins[1].value
    );
  }
);

const Not = new Circuit(
  1,
  1,
  150,
  100,
  CircuitRunMethod.OnInputChange,
  (self) => {
    self.producerPins[0].setValue(!self.consumerPins[0].value);
  }
);

const circuits = [Clock1, Or, Not];
const wires = [
  new Wire(Clock1, 0, Or, 0),
  new Wire(Clock1, 0, Not, 0),
  new Wire(Not, 0, Or, 1),
];

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < wires.length; i++) {
    wires[i].draw(ctx);
  }
  for (let i = 0; i < circuits.length; i++) {
    circuits[i].draw(ctx);
  }
  console.log("draw");
}

let canvas = document.getElementById("main-canvas");
if (canvas == null) {
  throw Error("The dom does not contain a canvas");
}

let ctx: CanvasRenderingContext2D;

if ((canvas as HTMLCanvasElement).getContext("2d") != null) {
  ctx = (canvas as HTMLCanvasElement).getContext(
    "2d"
  ) as CanvasRenderingContext2D;
} else {
  throw Error("Could not get 2d context from canvas");
}

// document.addEventListener("click", () => draw(ctx));

setInterval(() => {
  draw(ctx);
}, 100);
