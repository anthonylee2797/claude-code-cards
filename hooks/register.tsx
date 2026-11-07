import type { EngineInterface, Register } from 'claude-code'

const RAINBOW = ['red', '#ff8c00', 'yellow', 'green', 'cyan', 'blue', 'magenta']
const TITLE = 'CLAUDE CODE CARDS'
const TIERS = [
  { name: 'Silver', color: 'gray' },
  { name: 'Gold', color: 'yellow' },
  { name: 'All-Star', color: 'cyan' },
  { name: 'All-Time', color: 'magenta' },
]
const SHIMMER_FRAMES = 25

let isShown = true
let frame = 0

function hide($: EngineInterface) {
  isShown = false
  $.ui.invalidate('ui.render')
}

export const register: Register = on => {
  isShown = true
  frame = 0

  // Shimmer the rainbow title for ~3s, then hold still.
  on('session.start', ($, e, next) => {
    const stop = $.clock.every(120, () => {
      frame += 1
      if (frame >= SHIMMER_FRAMES || !isShown) stop()
      $.ui.invalidate('ui.render')
    })
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isShown || e.props.hasSurvey) return next(e)
    const below = await next(e)
    const { Box, Button, Text } = $.ui.resolve(e)

    if (e.surface !== 'terminal') {
      return (
        <Box flexDirection="column">
          <Box>
            <Text>🏀 nba test card 1.02 </Text>
            <Button key="hide" label="Hide" onPress={() => hide($)} />
          </Box>
          {below}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Box borderStyle="quote" borderColor={RAINBOW[frame % RAINBOW.length]} paddingX={1} flexDirection="column">
          {/* Animated rows stay emoji-free: emoji widths differ across terminals and smear redraws. */}
          <Box>
            {TITLE.split('').map((ch, i) => (
              <Text bold color={RAINBOW[(i + frame) % RAINBOW.length]}>{ch}</Text>
            ))}
          </Box>
          <Box>
            <Text>🏀 nba test card 1.02 · </Text>
            <Text bold color="yellow">A fresh pack is waiting. 🔥</Text>
          </Box>
          <Box>
            <Text dimColor>Tiers: </Text>
            {TIERS.map(t => (
              <Box key={t.name}>
                <Text bold color={t.color}>{t.name}</Text>
                <Text dimColor> · </Text>
              </Box>
            ))}
            {'SHINY'.split('').map((ch, i) => (
              <Text bold color={RAINBOW[(i + frame) % RAINBOW.length]}>{ch}</Text>
            ))}
          </Box>
          <Box>
            <Button key="hide" label="Hide" onPress={() => hide($)} />
          </Box>
        </Box>
        {below}
      </Box>
    )
  })
}
