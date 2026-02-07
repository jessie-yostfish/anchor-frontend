interface MarkdownDisplayProps {
  content: string
}

export function MarkdownDisplay({ content }: MarkdownDisplayProps) {
  const formatContent = (text: string) => {
    const lines = text.split('\n')
    const formattedLines: JSX.Element[] = []

    lines.forEach((line, index) => {
      if (line.trim().startsWith('# ')) {
        formattedLines.push(
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {line.replace(/^#\s+/, '')}
          </h2>
        )
      } else if (line.trim().startsWith('## ')) {
        formattedLines.push(
          <h3 key={index} className="text-lg font-bold text-gray-900 mt-5 mb-2">
            {line.replace(/^##\s+/, '')}
          </h3>
        )
      } else if (line.trim().startsWith('### ')) {
        formattedLines.push(
          <h4 key={index} className="text-base font-bold text-gray-900 mt-4 mb-2">
            {line.replace(/^###\s+/, '')}
          </h4>
        )
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        formattedLines.push(
          <div key={index} className="flex items-start gap-2 ml-4 mb-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span className="text-gray-700 flex-1">{line.replace(/^[-•]\s+/, '')}</span>
          </div>
        )
      } else if (line.trim().startsWith('* ')) {
        formattedLines.push(
          <div key={index} className="flex items-start gap-2 ml-4 mb-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span className="text-gray-700 flex-1">{line.replace(/^\*\s+/, '')}</span>
          </div>
        )
      } else if (line.match(/^\d+\.\s+/)) {
        const number = line.match(/^(\d+)\.\s+/)?.[1]
        formattedLines.push(
          <div key={index} className="flex items-start gap-2 ml-4 mb-2">
            <span className="text-purple-600 font-semibold">{number}.</span>
            <span className="text-gray-700 flex-1">{line.replace(/^\d+\.\s+/, '')}</span>
          </div>
        )
      } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        formattedLines.push(
          <p key={index} className="font-bold text-gray-900 mt-3 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        )
      } else if (line.trim() === '') {
        formattedLines.push(<div key={index} className="h-2" />)
      } else if (line.trim().length > 0) {
        const formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        formattedLines.push(
          <p
            key={index}
            className="text-gray-700 mb-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        )
      }
    })

    return formattedLines
  }

  return <div className="space-y-1">{formatContent(content)}</div>
}
