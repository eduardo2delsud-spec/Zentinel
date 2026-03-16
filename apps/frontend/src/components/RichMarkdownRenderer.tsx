import mermaid from "mermaid";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Configuración inicial de mermaid
mermaid.initialize({
	startOnLoad: true,
	theme: "dark",
	securityLevel: "loose",
	fontFamily: "Inter, system-ui, sans-serif",
});

const Mermaid = ({ chart }: { chart: string }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current && chart) {
			mermaid
				.render(`mermaid-${Math.random().toString(36).substring(2, 11)}`, chart)
				.then((result) => {
					if (ref.current) {
						ref.current.innerHTML = result.svg;
					}
				})
				.catch((err) => {
					console.error("Mermaid Render Error:", err);
				});
		}
	}, [chart]);

	return (
		<div
			ref={ref}
			className="mermaid-container"
			style={{ margin: "1.5rem 0", borderRadius: "8px", overflow: "hidden" }}
		/>
	);
};

export const RichMarkdownRenderer = ({ content }: { content: string }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				code(props) {
					const { className, children } = props;
					const match = /language-(\w+)/.exec(className || "");
					const lang = match ? match[1] : "";

					if (lang === "mermaid") {
						return <Mermaid chart={String(children).replace(/\n$/, "")} />;
					}

					return match ? (
						<SyntaxHighlighter
							style={vscDarkPlus}
							language={lang}
							PreTag="div"
							customStyle={{
								borderRadius: "8px",
								margin: "1rem 0",
								background: "rgba(0,0,0,0.3)",
								border: "1px solid rgba(255,255,255,0.1)",
							}}
						>
							{String(children).replace(/\n$/, "")}
						</SyntaxHighlighter>
					) : (
						<code className={className}>{children}</code>
					);
				},
				table({ children }) {
					return (
						<div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
							<table
								style={{
									width: "100%",
									borderCollapse: "collapse",
									border: "1px solid var(--border-luxe)",
								}}
							>
								{children}
							</table>
						</div>
					);
				},
				th({ children }) {
					return (
						<th
							style={{
								border: "1px solid var(--border-luxe)",
								padding: "12px",
								background: "rgba(255,255,255,0.05)",
								textAlign: "left",
							}}
						>
							{children}
						</th>
					);
				},
				td({ children }) {
					return (
						<td
							style={{
								border: "1px solid var(--border-luxe)",
								padding: "12px",
							}}
						>
							{children}
						</td>
					);
				},
			}}
		>
			{content}
		</ReactMarkdown>
	);
};
