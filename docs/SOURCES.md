# Источники формата переноса

Официальные страницы прочитаны 21 октября 2026 года:

- [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic) — пользовательский config.toml и приоритет слоёв конфигурации.
- [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) — современные профили в отдельных `<name>.config.toml`, выбор через `--profile`.
- [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) — глобальные и проектные инструкции, действие AGENTS.override.md.
- [Build skills](https://learn.chatgpt.com/docs/build-skills) — пользовательские навыки в `~/.agents/skills`, обнаружение и плагины.

`frontend-react-workflow` и рабочие соглашения написаны для этого комплекта на основе проверенного React/TypeScript/Vite/CSS/БЭМ/GSAP/Lenis-процесса. Технические источники — в [STACK.md](STACK.md).

GSAP, Copy Editing и Humanizer — снимки исходных навыков с лицензиями. Их происхождение указано в [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md), точные SHA-256 — в manifest.json. В manifest входят устанавливаемые файлы, документация и скрипты; служебные Git-файлы и архивы в него не входят.

[Плагины](https://learn.chatgpt.com/docs/plugins) устанавливаются и подключаются отдельно. [plugins.json](../plugins.json) описывает нужные возможности, без машинных путей и версии кеша старой установки.
