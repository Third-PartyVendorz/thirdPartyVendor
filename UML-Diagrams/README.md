# UML Diagrams - Trading App

This directory contains the Object UML class diagram for the Third Party Vendor Trading Application.

## Files

- **object-uml.mmd** - Mermaid diagram source file
- **object-uml.png** - Generated PNG visualization of the class diagram

## Generating the PNG Diagram

### Prerequisites

You need to have **Node.js** and **npm** installed on your system.

### Installation

Install Mermaid CLI globally (one-time setup):

```bash
npm install -g @mermaid-js/mermaid-cli
```

### Generate the PNG

Run the following command from the project root directory:

```bash
mmdc -i "UML-Diagrams/<type-of-uml>-UML/<type-of-UML>-uml.mmd" -o "UML-Diagrams/<type-of-UML>-uml.png"
```

Or if you're already in the UML-Diagrams folder:

```bash
mmdc -i <type-of-uml>-uml.mmd -o <type-of-uml>-uml.png
```

The PNG will be generated in the same directory.

## Advanced Options

### Custom Size

```bash
mmdc -i "UML-Diagrams/<type-of-uml>-UML/<type-of-UML>-uml.mmd" -o "UML-Diagrams/<type-of-UML>-uml.png" -w 1920 -H 1080
```

### Higher Resolution (Retina)

```bash
mmdc -i "UML-Diagrams/<type-of-uml>-UML/<type-of-UML>-uml.mmd" -o "UML-Diagrams/<type-of-UML>-uml.png" --scale 2
```

### Different Theme

```bash
mmdc -i "UML-Diagrams/<type-of-uml>-UML/<type-of-UML>-uml.mmd" -o "UML-Diagrams/<type-of-UML>-uml.png" --theme dark
```

Available themes: `default`, `forest`, `dark`, `neutral`

## Diagram Overview

The object UML diagram includes the following key classes:

- **User** - Central entity managing account information, authentication, and trading activity
- **Order** - Represents a buy/sell order placed by a user
- **Trade** - Executed transaction of an order
- **Asset** - Holdings owned by a user
- **Settlement** - Settlement details for completed trades
- **CashFlow** - Cash transactions and account movements
- **Session** - User login sessions
- **MarketData** - Real-time price and trading volume information
- **ComplianceReport** - Regulatory compliance documentation
- **AuditLog** - Activity and change tracking
- **Fee** - Transaction and account fees
- **Statement** - Period account statements
- **TradingRule** - Validation rules for orders
- **OrderIntent** - Original intent/purpose of an order

## Relationships

The diagram includes 14 primary relationships defining:
- User-to-Entity associations (User owns Assets, places Orders, etc.)
- Order-to-Trade flow (Order creates Trades)
- Settlement relationships (Order-to-Settlement linkage)
- Audit and compliance tracking
- Market data and asset tracking

## Editing the Diagram

To edit the diagram:

1. Open `object-uml.mmd` in VS Code or any text editor
2. Make your changes using Mermaid class diagram syntax
3. Save the file
4. Run the generation command above to update the PNG

For more information on Mermaid class diagram syntax, visit: [Mermaid Class Diagram Documentation](https://mermaid.js.org/syntax/classDiagram.html)

## Troubleshooting

### Command not found: mmdc

Make sure you've installed mermaid-cli globally:
```bash
npm install -g @mermaid-js/mermaid-cli
```

### File not found errors

Ensure you're running the command from the correct directory or use full paths to the files.

### High resolution images take too long

If the generation is slow with high resolution, reduce the `--scale` value or remove it.

## Team Workflow

1. Clone the repository
2. Install mermaid-cli: `npm install -g @mermaid-js/mermaid-cli`
3. Generate the PNG: `mmdc -i "UML-Diagrams/object-uml.mmd" -o "UML-Diagrams/object-uml.png"`
4. View the generated `object-uml.png` in the UML-Diagrams folder
