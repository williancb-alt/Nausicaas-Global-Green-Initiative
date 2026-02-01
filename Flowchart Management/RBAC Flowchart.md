                    ┌─────────────────┐
                    │   Landing Page  │
                    └─────────┬───────┘
                              │
                    ┌─────────▼─────────┐
                    │   Login/Register  │
                    └─────────┬─────────┘
                              │
                ┌─────────────▼─────────────┐
                │     Fetch User Role       │
                │     from Database         │
                └─────────┬─────────────┬───┘
                          │             │
                ┌─────────▼───┐  ┌──────▼─────┐
                │  Admin      │  │   Regular  │
                │  Dashboard  │  │  User View │
                └──────┬──────┘  └─────┬──────┘
                       │                │
        ┌──────────────▼──────────────┐ │ ┌──────────────────┐
        │  ADMIN CONTROLS             │ │ │ USER VIEW ONLY   │
        │                             │ │ │                  │
        │ • Create Grants  ┌──────────┼─┼─→• Organization    │
        │ • Edit Grants    │          │ │  │   Description   │
        │ • Delete Grants  │          │ │  │                 │
        │ • Manage Users   │◄─────────┘ │  │ • Grant Lists   │
        │ • Change Status  │            │  │                 │
        └──────────────────┘            │  │ • Apply Button  │
                                        │  └─────────────────┘

