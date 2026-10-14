# Event Backbone Flow - Kafka Sequence Diagram Presentation (5 MINUTES)

---

## SLIDE 1: What This Diagram Shows

### Event-Driven Order Flow
This diagram shows how a submitted order becomes an event and is executed later by a separate consumer.

### Core Flow
- **User** submits an order in the frontend
- **Order API** validates and stores the order as `PENDING`
- **Outbox / Kafka** publishes `OrderAccepted`
- **Execution Consumer** consumes the message and performs execution
- **Trade / Holdings / Cash** are updated together in one transaction

### Why This Matters
This is the event backbone for the sprint: acceptance and execution are separate steps, connected by messages instead of one request doing everything.

---

## SLIDE 2: The Message Journey

### Step 1: Accept the Order
```
User -> Frontend -> Order API -> Order DB
```
- Validate the request
- Persist the order with status `PENDING`
- Write an outbox event for `OrderAccepted`
- Return `202 Accepted` with the order id

### Step 2: Publish to Kafka
```
Outbox -> Kafka -> Execution Consumer
```
- Kafka carries the order intent to the execution side
- This is the handoff point between intake and execution
- Other consumers can also listen later, such as portfolio updates or notifications

### Step 3: Execute the Order
```
Execution Consumer -> Market Data API -> Trade / Holdings / Cash DB
```
- Fetch a live quote at execution time
- Create the trade
- Update holding quantity and cash balance
- Mark the order as `EXECUTED`

---

## SLIDE 3: Duplicate Delivery and Idempotency

### The Kafka Reality
Kafka can deliver the same message more than once.

### What the Consumer Does
- Check an idempotency ledger using `eventId` or `orderId`
- If the event was already processed, acknowledge it and stop
- If it is new, execute exactly once inside the transactional path

### Why This Is Important
Without this check, the same order event could:
- create duplicate trades
- double-debit cash
- duplicate position changes

### What We Would Demonstrate
The second delivery of the same event should be a no-op with no extra trade, no extra cash movement, and no extra position change.

---

## SLIDE 4: How BR-09 Stays True

### BR-09 Requirement
Order status, cash movement, and position update must succeed or fail together.

### Execution-Side Answer
The consumer wraps the execution work in one transaction:
- write the trade record
- update the holding
- update the cash balance
- mark the order as executed

### Result
If any part fails, the whole unit rolls back and the order stays unexecuted.

### Key Point
The execution service is the system of record for the final state change, not the intake request.

---

## SLIDE 5: How BR-08 and Failure Handling Work

### BR-08 Requirement
A current market quote is required at execution time.

### Design Choice
- The consumer fetches the quote when the event is consumed
- If the quote is unavailable, the message is retried
- If retries are exhausted, the event goes to a dead-letter topic

### Why This Is Better Than Doing It Up Front
- The quote is checked at the moment of execution, not stale order submission time
- Execution can be delayed without losing the original order intent
- The system can recover cleanly from market-data outages

---

## SLIDE 6: Why This Design Works

### Multi-Layer Protection
- **Separation of concerns:** intake and execution are different components
- **At-least-once safe:** duplicate deliveries do not create duplicate effects
- **Atomic updates:** trade, cash, holding, and status move together
- **Failure isolation:** bad quotes or downstream errors do not corrupt the accepted order

### Honest Constraint
The current project still runs synchronously today, so this diagram is the proposed event backbone for the next implementation step rather than a finished Kafka pipeline.

### Key Insight
**We keep the order intent durable first, then let execution catch up safely through messages.**

---

## PRESENTER NOTES

### How to Present (5 minutes)

1. **Slide 1 (1 min):** Explain that this is the new event backbone: order intake is no longer the same thing as execution.
2. **Slide 2 (1.5 min):** Walk through the message path from the API to Kafka to the execution consumer.
3. **Slide 3 (1 min):** Emphasize duplicate delivery and the idempotency ledger. The second delivery must do nothing.
4. **Slide 4 (1 min):** Show how BR-09 stays true by keeping trade, cash, holding, and status in one transaction.
5. **Slide 5 (0.5 min):** Explain the live quote requirement, retry path, and dead-letter fallback.

### Key Points to Emphasize
- Acceptance and execution are separate on purpose
- Kafka can redeliver, so the consumer must be idempotent
- The execution side owns the atomic state change
- Quote lookup happens at execution time, not request time

### Short Version
“We accept the order once, publish it as an event, and execute it later in a way that is safe if Kafka delivers the same message twice.”
