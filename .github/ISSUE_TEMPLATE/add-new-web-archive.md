---
name: Add New Web Archive
about: Request support for a new web archive
title: 'Add New Web Archive: [WEB ARCHIVE NAME HERE]'
labels: add web archive
assignees: ''

---

## Web Archive Information
- **Web Archive Name**:
- **Organisation**:
- **Country**:
- **Continent**:
- **Web Archive Website**:

## Memento Protocol and CDX Endpoints
Provide the standard Memento endpoints. Replace `${url}` and `${datetime}` with the literal placeholders if needed:

- **CDX Address (optional)**: [e.g., https://arquivo.pt/wayback/cdx?url=${url}]  
- **TimeMap Address (optional)**: [e.g., https://archive.org/wayback/timemap/json/${url}]  
- **TimeGate Endpoint**: [e.g., https://archive.org/wayback/]  

## Replay API Endpoints
- **Raw content (id_ endpoint)**: [e.g., https://archive.org/noFrame/replay/${datetime}id_/${url}]
- **Navigation suppressed (if_ endpoint)**: [e.g., https://archive.org/noFrame/replay/${datetime}if_/${url}]

## Additional Notes
[Any quirks or special behaviour that might affect resource retrieval, embedding, or replay. For example, excluded paths or cleaning rules.]
