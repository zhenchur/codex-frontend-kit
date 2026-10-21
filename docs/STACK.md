# Стек фронтенда

Базовый рабочий стек: **React + TypeScript + Vite, обычный CSS с БЭМ,
GSAP / @gsap/react / ScrollTrigger и Lenis для плавной прокрутки**. Для существующего
репозитория приоритет у его package.json, lockfile и согласованной архитектуры.
Комплект правил не выполняет миграцию и не устанавливает библиотеки приложения.

## Проверенная основа

21 октября 2026 года стек сверен с локальными package.json, package-lock.json,
React-точками входа, CSS и motion-кодом. Имена рабочих проектов, личные пути,
ассеты и брендовые токены в комплект не перенесены.

| Часть | Зафиксировано в проверенных lockfiles |
| --- | --- |
| React / React DOM | 19.2.8 |
| TypeScript | 6.0.3 |
| Vite | 8.2.0 и 8.2.2 |
| GSAP | 3.15.0 |
| @gsap/react | 2.1.2 |
| Lenis в рабочей интеграции прокрутки | 1.3.26 |

Это снимок используемых версий, не указание обновлять каждый проект до них.
В package.json проверены npm и требование Node `^20.19.0 || >=22.12.0`;
при переносе сверяй engines своего проекта. Самому установщику комплекта нужен
Node 22.12+ согласно его package.json.

Исходники подтверждают отдельный модуль регистрации GSAP, scoped `useGSAP`,
глобальные CSS-файлы с custom properties и обычные CSS-файлы компонентов с БЭМ.
В проверенной Lenis-интеграции: один hook в оболочке, `autoRaf: false`, GSAP ticker
с `time * 1000`, `syncTouch: false`, `respectReducedMotion: true`, удаление ticker
и подписок перед `destroy()`. Tailwind не является частью этой основы.

## Организация кода

- `ProductCard.tsx` — React-компонент; `useCardMotion.ts` — hook. Функции, переменные и props — camelCase.
- БЭМ: `product-card`, `product-card__title`, `product-card--featured`, `product-card__title--muted`. Модификатор дополняет базовый класс.
- Глобальный CSS содержит reset, токены и базовую типографику; CSS компонента лежит рядом и ограничен его БЭМ-префиксом.
- GSAP и его плагины регистрируются в общем motion-модуле; компонент владеет своими анимациями и cleanup.
- Lenis принадлежит одному владельцу основного scroller. Один цикл кадров, единая навигация, reduced motion и нативный touch входят в контракт интеграции.

Процесс разработки закреплён в [frontend-react-workflow](../skills/frontend-react-workflow/SKILL.md),
правила — в [profile/AGENTS.md](../profile/AGENTS.md). Применение Lenis подробно
описано в [reference навыка](../skills/frontend-react-workflow/references/lenis.md).

Официальная документация проверена при подготовке: [Lenis](https://github.com/darkroomengineering/lenis),
[Lenis React](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md),
[React и GSAP](https://gsap.com/resources/React/) и [GSAP ticker](https://gsap.com/docs/v3/GSAP/gsap.ticker/).
