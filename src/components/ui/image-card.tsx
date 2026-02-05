import { cn } from "@/lib/utils";

type Props = {
	imageUrl: string;
	caption: string;
	className?: string;
};

export default function ImageCard({ imageUrl, caption, className }: Props) {
	return (
		<figure
			className={cn(
				"w-[250px] overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow",
				className,
			)}
		>
			<img className="aspect-4/3 w-full" src={imageUrl} alt="card" />
			<figcaption className="border-border border-t-2 p-4 text-main-foreground">
				{caption}
			</figcaption>
		</figure>
	);
}
