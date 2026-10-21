# Codex frontend kit

Самостоятельный комплект для переноса рабочего процесса фронтенда: **React + TypeScript + Vite, CSS/БЭМ, GSAP и Lenis**. Включает 11 навыков, рабочие правила, шаблон проектного AGENTS.md и установщик. Существующие проекты сохраняют свой стек; эти настройки задают основу для новых.

Публичный репозиторий: [zhenchur/codex-frontend-kit](https://github.com/zhenchur/codex-frontend-kit). Для скачивания аккаунт GitHub не нужен.

## Установка одной командой

Сначала установите [Node.js](https://nodejs.org/en/download) версии 22.12+ (проверена 24.12) и [приложение с Codex](https://learn.chatgpt.com/docs/app). Войдите в Codex. Git для команды ниже не нужен.

**Windows, PowerShell:**

```powershell
npx.cmd --yes --package=https://github.com/zhenchur/codex-frontend-kit/archive/refs/heads/main.tar.gz codex-frontend-kit
```

**macOS / Linux:**

```sh
npx --yes --package=https://github.com/zhenchur/codex-frontend-kit/archive/refs/heads/main.tar.gz codex-frontend-kit
```

Команда скачивает комплект, проверяет хеши и устанавливает все включённые навыки и правила. После установки начните новый чат Codex. Если новые навыки не появились, перезапустите приложение. Для обновления выполните ту же команду снова.

Figma и GitHub подключаются к вашему аккаунту один раз через официальный каталог плагинов. Их OAuth-вход нельзя перенести вместе с файлами. [Установка и подключения](docs/SETUP.md).

## Что установится

- `frontend-react-workflow`: React/TypeScript/Vite, структура компонентов, CSS/БЭМ, GSAP lifecycle, Lenis и ScrollTrigger.
- Восемь GSAP-навыков: `gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `gsap-utils`, `gsap-frameworks`.
- `copy-editing` и `humanizer`: работа с текстами интерфейса по соответствующему запросу.
- Общие правила из [profile/AGENTS.md](profile/AGENTS.md): точная Figma-нода, компоненты и токены, адаптивность, доступность, проверки и передача результата.
- Отдельный профиль модели `frontend.config.toml` и переносимое правило запуска `npm run dev`.

Навыки копируются в `~/.agents/skills`. Правила добавляются отдельным блоком в `~/.codex/AGENTS.md`; при наличии непустого `AGENTS.override.md` — в него, поскольку он имеет приоритет. `CODEX_HOME` учитывается для конфигурации и правил. Сторонний текст AGENTS сохраняется, обновляемые файлы комплекта получают резервные копии в `frontend-kit-backups`.

Базовый `config.toml`, авторизация и история чатов не изменяются. Отдельный профиль содержит `gpt-6-astra / ultra / priority`; он необязателен и включается в поддерживающем его CLI командой `codex --profile frontend`. Frontend-правила и навыки действуют без выбора профиля. [Настройки и ограничения](docs/SETUP.md).

## Рабочие соглашения

React-компоненты — `PascalCase`, хуки — `useSomething`, переменные и функции — `camelCase`. CSS — БЭМ: `block`, `block__element`, `block--modifier`; модификатор сохраняет базовый класс. Глобальные токены и обычный CSS компонентов, без добавления Tailwind или CSS Modules в этот стек.

Lenis управляется одним владельцем прокрутки. При интеграции с GSAP используется один цикл обновления, перевод секунд ticker в миллисекунды, очистка обработчиков и экземпляра. Учитываются reduced motion, нативный touch-скролл и React StrictMode. [Стек и примеры](docs/STACK.md).

Шаблон [templates/project-AGENTS.md](templates/project-AGENTS.md) можно скопировать в новый проект и уточнить команды. Установщик не создаёт и не переписывает проекты.

## Проверка без установки и ручной режим

Добавьте `--dry-run` в конец основной команды для просмотра плана без записи. Для клонированного комплекта:

```sh
npm run verify
npm test
node scripts/setup.mjs --dry-run
node scripts/setup.mjs
```

Низкоуровневый `scripts/install.mjs` сохраняет выборочные флаги (`--include-optional`, `--include-command-rules`, `--merge-agents`, `--replace-existing`). По умолчанию он показывает план; основной `setup.mjs` устанавливает полный комплект и обновляет его файлы с резервной копией.

Проверены установка в изолированный профиль Windows, обновление, повторный запуск, сохранение существующих правил, активный AGENTS.override.md и остановка до записи при несовпадении хешей. Проверка установленного npm-пакета выполняется отдельно от рабочей папки. macOS и Linux требуют проверки на соответствующей системе.

[Источники](docs/SOURCES.md) · [Лицензии навыков](THIRD-PARTY-NOTICES.md) · [Что не переносится](docs/EXCLUDED.md)
