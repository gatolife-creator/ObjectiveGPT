const mainElement = document.querySelector('main') as HTMLElement
const inputForm = mainElement.querySelector('form') as HTMLFormElement
const textAreaElement = inputForm.querySelector('textarea') as HTMLTextAreaElement
const resultStreaming = document.querySelector('.result-streaming')
const latestConversation = Array.from(document.querySelectorAll('.markdown')).at(-1) as HTMLElement

const startButton = document.createElement('button')
startButton.textContent = 'START'
startButton.style.position = 'fixed'
startButton.style.top = '25px'
startButton.style.right = '120px'
startButton.className =
  'btn btn-neutral whitespace-nowrap text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal'

const regenerateButton = document.querySelector('form')!.querySelector('button')

export { textAreaElement, startButton, regenerateButton, resultStreaming, latestConversation }
