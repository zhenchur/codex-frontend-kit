# Источники формата переноса

Официальные страницы прочитаны 21 октября 2026 года:

- [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic) — пользовательский config.toml и приоритет слоёв конфигурации.
- [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) — современные профили в отдельных `<name>.config.toml`, выбор через `--profile`.
- [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) — глобальные и проектные инструкции, действие AGENTS.override.md.
- [Build skills](https://learn.chatgpt.com/docs/build-skills) — пользовательские навыки в `~/.agents/skills`, обнаружение и плагины.

Содержимое навыков в `skills/` и `optional-skills/` — локальные снимки, а не
пересказ этих страниц. SHA-256 и логические пути происхождения записаны в manifest.
Версия GSAP-навыков в их исходных файлах явно не указана; идентичность фиксируется
хешами. У плагина Figma обнаружена версия 16.0.0; список его нужных навыков и порядок
восстановления приведены в plugins.json.
