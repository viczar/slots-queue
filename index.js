const { EventEmitter } = require("events");

class SlotsQueue extends EventEmitter {
  constructor(queue, slots, processMessage) {
    super();

    this.queue = queue;
    this.slots = slots;
    this.occupied_slots = 0;
    this.counts = 0;
    this.isPaused = false;
    this.processMessage = processMessage;

    this.on("next", async (message) => {
      this.counts++;
      this.occupied_slots++;

      try {
        await this.processMessage(message, this.counts);
      } catch (error) {
        console.error(error);
      }
      this.occupied_slots--;

      if (!this.isPaused) {
        for (let i = this.occupied_slots; i < this.slots; i++) {
          const next_msg = this.queue.shift();
          if (next_msg) this.emit("next", next_msg);
        }
      }
    });
  }

  start() {
    for (let i = this.occupied_slots; i < this.slots; i++) {
      const next_msg = this.queue.shift();
      if (next_msg) this.emit("next", next_msg);
    }
  }

  appendToQueue(newMessages) {
    for (let message of newMessages) {
      this.queue.push(message);
    }
    for (let i = this.occupied_slots; i < this.slots; i++) {
      const next_msg = this.queue.shift();
      if (next_msg) this.emit("next", next_msg);
    }
  }

  cleanQueue() {
    this.queue = [];
  }
}

module.exports = SlotsQueue;
