# Lenis: один владелец и один цикл кадров

Используй для подключения или изменения плавной прокрутки. Сначала найди
существующий экземпляр и его владельца. Владелец основного scroller находится
в оболочке приложения; секции используют общий экземпляр.

Для ручной интеграции с GSAP отключи `autoRaf`, импортируй CSS Lenis и передавай
в `raf` миллисекунды. Следующий фрагмент показывает lifecycle; пути импорта,
readiness и обработку маршрутов адаптируй к проекту:

```tsx
import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger } from './gsap'

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      respectReducedMotion: true,
    })
    const tick = (seconds: number) => lenis.raf(seconds * 1000)
    const unsubscribe = lenis.on('scroll', () => ScrollTrigger.update())
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      unsubscribe()
      lenis.destroy()
    }
  }, [enabled])
}
```

Вызови этот hook один раз у владельца. React StrictMode должен завершать старый
экземпляр до нового setup. Если уже используется `ReactLenis` из `lenis/react`,
сохрани adapter и подключи ticker через его ref с `autoRaf: false`; не создавай
рядом ручной экземпляр. [Официальная интеграция React](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md#gsap-integration).

`gsap.ticker.lagSmoothing(0)` из рекомендованной интеграции — настройка всего GSAP.
При необходимости задай её один раз в общем motion-модуле; не переключай её из
каждой секции и не восстанавливай выдуманные прежние значения. [GSAP ticker](https://gsap.com/docs/v3/GSAP/gsap.ticker/).

Для текущего Lenis `respectReducedMotion: true` отключает сглаживание при reduce;
`syncTouch: false` сохраняет нативный touch. Проверь поддержку опций установленной
версией; для старого API организуй отключение сглаживания через matchMedia.
Настрой якоря, восстановление позиции, вложенные scroll-контейнеры и блокировки
модальных окон совместно с текущим router. Не останавливай весь скролл ради reduced
motion. После layout-изменений вызывай resize/refresh, сохраняя порядок навигации.
Для обычного window-scroller не добавляй scrollerProxy без необходимости.
[Официальные настройки и синхронизация Lenis](https://github.com/darkroomengineering/lenis#setup).

При cleanup также отмени свои RAF, таймеры, observers, подписки router/media и
поздние async callbacks. `useGSAP` очищает GSAP-контекст, но эти ресурсы остаются
ответственностью их владельца. [React lifecycle GSAP](https://gsap.com/resources/React/).
