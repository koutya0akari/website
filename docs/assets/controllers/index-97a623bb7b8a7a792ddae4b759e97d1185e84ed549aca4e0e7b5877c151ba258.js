import { application } from './application'

import HelloController from './hello_controller'
import DiaryController from './diary_controller'
import HeroHighlightController from './hero_highlight_controller'
import RevealController from './reveal_controller'
import SmoothScrollController from './smooth_scroll_controller'

application.register('hello', HelloController)
application.register('diary', DiaryController)
application.register('hero-highlight', HeroHighlightController)
application.register('reveal', RevealController)
application.register('smooth-scroll', SmoothScrollController);
