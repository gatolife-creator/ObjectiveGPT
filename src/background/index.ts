export type Message = {
  name: string
  message: string
}

chrome.runtime.onMessage.addListener((req: Message) => {
  if (req.name === 'start') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log({ tabs })
      const id = tabs[0].id as number

      chrome.tabs.sendMessage(id, {
        name: 'start',
        message: req.message,
      })
    })
  } else if (req.name === 'stop') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log({ tabs })
      const id = tabs[0].id as number

      chrome.tabs.sendMessage(id, {
        name: 'stop',
      })
    })
  }
})
