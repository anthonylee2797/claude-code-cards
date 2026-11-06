import type { EngineInterface, Register } from 'claude-code'

let isShown = true

function hide($: EngineInterface) {
  isShown = false
  $.ui.invalidate('ui.render')
}

export const register: Register = on => {
  isShown = true

  on('prompt.submit', ($, e, next) => {
    if (isShown) hide($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isShown || e.props.hasSurvey) return next(e)
    const below = await next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        <Box>
          <Text>🏀 claude card nba plug in - welcome </Text>
          <Button key="hide" label="Hide" onPress={() => hide($)} />
        </Box>
        {below}
      </Box>
    )
  })
}
