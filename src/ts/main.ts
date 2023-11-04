class Wire {
  from: ProducerPin;
  to: ConsumerPin;

  constructor(from: ProducerPin, to: ConsumerPin) {
    this.from = from;
    this.to = to;
  }

  propogateValue(value: boolean) {
    this.to.consumeValue(value);
  }
}

class ConsumerPin {
  wire: Wire | undefined;
  value: boolean;

  constructor(wire: Wire | undefined = undefined) {
    this.wire = wire;
    this.value = false;
  }

  consumeValue(value: boolean) {
    this.value = value;
  }
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (this.value) {
      ctx.fillStyle = "red";
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

class ProducerPin {
  wire: Wire | undefined;
  value: boolean;

  constructor(wire: Wire | undefined = undefined) {
    this.wire = wire;
    this.value = false;
  }

  setValue(value: boolean) {
    this.value = value;
    if (this.wire) {
      this.wire.propogateValue(value);
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (this.value) {
      ctx.fillStyle = "red";
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
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
      this.consumerPins[i] = new ConsumerPin();
    }

    this.producerPins = Array(nProducerPins);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin();
    }
    this.func = func || ((self) => {});
    this.pos_x = pos_x;
    this.pos_y = pos_y;

    if (runMethod === CircuitRunMethod.Interval && this.func != null) {
      setInterval(() => {
        this.func(this);
      }, 1000);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      this.pos_x,
      this.pos_y,
      Circuit.width,
      this.consumerPins.length > this.producerPins.length
        ? this.consumerPins.length * 70
        : this.producerPins.length * 70
    );

    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i].draw(ctx, this.pos_x, this.pos_y + i * 70, 10);
    }
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i].draw(
        ctx,
        this.pos_x + Circuit.width,
        this.pos_y + i * 70,
        10
      );
    }
  }
}

const Clock = new Circuit(0, 1, 30, 30, CircuitRunMethod.Interval, (self) => {
  self.producerPins[0].setValue(!self.producerPins[0].value);
});
const OutputDisplay = new Circuit(1, 0, 200, 30);

const wire = new Wire(Clock.producerPins[0], OutputDisplay.consumerPins[0]);

Clock.producerPins[0].wire = wire;
OutputDisplay.consumerPins[0].wire = wire;

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  Clock.draw(ctx);
  OutputDisplay.draw(ctx);
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
