import { InventoryItem, Transaction, User } from "@/types/inventory";

export const mockUsers: User[] = [
  { id: "u1", name: "John Kamau", email: "john@buildtrack.co", role: "Admin", createdAt: "2024-01-15" },
  { id: "u2", name: "Mary Wanjiku", email: "mary@buildtrack.co", role: "Staff", createdAt: "2024-03-10" },
  { id: "u3", name: "Peter Ochieng", email: "peter@buildtrack.co", role: "Staff", createdAt: "2024-06-01" },
];

export const mockItems: InventoryItem[] = [
  { id: "i1", name: "Copper Wire 2.5mm", department: "Electrical", quantity: 450, minThreshold: 100, specification: "2.5mm single core, PVC insulated, 100m roll, 450/750V rating", dateAdded: "2024-08-12" },
  { id: "i2", name: "MCB 20A Single Pole", department: "Electrical", quantity: 35, minThreshold: 20, specification: "20 Amp miniature circuit breaker, single pole, C-curve, 6kA breaking capacity", dateAdded: "2024-09-03" },
  { id: "i3", name: "LED Panel Light 60x60", department: "Electrical", quantity: 12, minThreshold: 15, specification: "60x60cm recessed panel, 40W, 4000K daylight, 3600 lumens, IP20", dateAdded: "2024-10-18" },
  { id: "i4", name: "Distribution Board 12-Way", department: "Electrical", quantity: 8, minThreshold: 5, specification: "12-way TPN distribution board, surface mount, with busbar and neutral link", dateAdded: "2024-11-02" },
  { id: "i5", name: "PVC Conduit 20mm", department: "Electrical", quantity: 200, minThreshold: 50, specification: "20mm rigid PVC conduit, 3m lengths, heavy gauge, flame retardant", dateAdded: "2024-07-20" },
  
  { id: "i6", name: "PPR Pipe 25mm", department: "Plumbing", quantity: 85, minThreshold: 30, specification: "25mm PPR hot/cold water pipe, PN20, 4m length, green", dateAdded: "2024-08-05" },
  { id: "i7", name: "Gate Valve 1 inch", department: "Plumbing", quantity: 18, minThreshold: 10, specification: "1 inch brass gate valve, threaded, 200 PSI WOG, lead-free", dateAdded: "2024-09-14" },
  { id: "i8", name: "Water Closet Complete", department: "Plumbing", quantity: 4, minThreshold: 5, specification: "Close-coupled WC, dual flush 3/6L, soft-close seat, S-trap 100mm", dateAdded: "2024-10-25" },
  { id: "i9", name: "Kitchen Sink Mixer", department: "Plumbing", quantity: 7, minThreshold: 5, specification: "Single lever kitchen mixer, chrome finish, swivel spout, ceramic cartridge", dateAdded: "2024-11-10" },
  { id: "i10", name: "HDPE Pipe 110mm", department: "Plumbing", quantity: 25, minThreshold: 10, specification: "110mm HDPE drainage pipe, 6m length, SN4 ring stiffness", dateAdded: "2024-06-15" },

  { id: "i11", name: "Portland Cement 50kg", department: "General Construction", quantity: 120, minThreshold: 50, specification: "OPC 42.5N, 50kg bag, KEBS certified, Bamburi brand", dateAdded: "2024-07-01" },
  { id: "i12", name: "Steel Rebar Y16", department: "General Construction", quantity: 65, minThreshold: 30, specification: "Y16 deformed bar, 12m length, BS4449 Grade 500B", dateAdded: "2024-08-20" },
  { id: "i13", name: "Roofing Sheet 3m", department: "General Construction", quantity: 45, minThreshold: 20, specification: "Box profile roofing sheet, 3m x 1m, gauge 28, Safal blue", dateAdded: "2024-09-28" },
  { id: "i14", name: "Building Sand (Ton)", department: "General Construction", quantity: 8, minThreshold: 10, specification: "River sand, clean washed, per metric ton, for plastering/masonry", dateAdded: "2024-10-05" },
  { id: "i15", name: "Timber 2x4 Cypress", department: "General Construction", quantity: 180, minThreshold: 50, specification: "2x4 inch cypress, 12ft treated, kiln dried, structural grade", dateAdded: "2024-11-15" },
];

export const mockTransactions: Transaction[] = [
  { id: "t1", itemId: "i1", itemName: "Copper Wire 2.5mm", type: "Stock Out", quantity: 50, department: "Electrical", user: "Mary Wanjiku", date: "2025-02-28", notes: "Site A wiring" },
  { id: "t2", itemId: "i11", itemName: "Portland Cement 50kg", type: "Stock Out", quantity: 30, department: "General Construction", user: "Peter Ochieng", date: "2025-02-27", notes: "Foundation work" },
  { id: "t3", itemId: "i6", itemName: "PPR Pipe 25mm", type: "Stock In", quantity: 100, department: "Plumbing", user: "John Kamau", date: "2025-02-26", notes: "New supplier delivery" },
  { id: "t4", itemId: "i3", itemName: "LED Panel Light 60x60", type: "Stock Out", quantity: 8, department: "Electrical", user: "Mary Wanjiku", date: "2025-02-25", notes: "Office lighting" },
  { id: "t5", itemId: "i14", itemName: "Building Sand (Ton)", type: "Stock In", quantity: 15, department: "General Construction", user: "John Kamau", date: "2025-02-24" },
  { id: "t6", itemId: "i8", itemName: "Water Closet Complete", type: "Stock Out", quantity: 2, department: "Plumbing", user: "Peter Ochieng", date: "2025-02-23", notes: "Bathroom install Block B" },
  { id: "t7", itemId: "i12", itemName: "Steel Rebar Y16", type: "Stock In", quantity: 50, department: "General Construction", user: "John Kamau", date: "2025-02-22" },
  { id: "t8", itemId: "i2", itemName: "MCB 20A Single Pole", type: "Stock Out", quantity: 10, department: "Electrical", user: "Mary Wanjiku", date: "2025-02-21", notes: "DB installation" },
  { id: "t9", itemId: "i13", itemName: "Roofing Sheet 3m", type: "Stock Out", quantity: 20, department: "General Construction", user: "Peter Ochieng", date: "2025-02-20", notes: "Warehouse roof" },
  { id: "t10", itemId: "i7", itemName: "Gate Valve 1 inch", type: "Stock In", quantity: 15, department: "Plumbing", user: "John Kamau", date: "2025-02-19" },
];
