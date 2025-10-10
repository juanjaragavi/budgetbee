import type { IframeHTMLAttributes } from "react";

type YoutubeProps = IframeHTMLAttributes<HTMLIFrameElement> & {
  id: string;
  title: string;
};

const Youtube = ({ id, title, style, ...rest }: YoutubeProps) => {
  return (
    <div className="yt-lite rounded-lg overflow-hidden relative aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
        style={{ border: 0, ...style }}
        {...rest}
      />
    </div>
  );
};

export default Youtube;
