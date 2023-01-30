<div align="center">
<p align="center">
<img width="180" src="../../public/logo.png" alt="ChatGPT">
<h1 align="center">ChatGPT Desktop App Sync Custom</h1>
</div>

### Sync Custom

Currently, only json and csv are supported for synchronizing custom files, and the following formats need to be met, otherwise the application will be abnormal：

`JSON format:`

```json
[
  {
    "cmd": "a",
    "act": "aa",
    "prompt": "aaa aaa aaa"
  },
  {
    "cmd": "b",
    "act": "bb",
    "prompt": "bbb bbb bbb"
  }
]
```

`CSV format`

```csv
"cmd","act","prompt"
"a","aa","aaa aaa aaa"
"b","bb","bbb bbb bbb"
```
