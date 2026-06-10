"use client";

import { useState } from "react";
import Image from "next/image";
import type { YouTubeVideo } from "@/lib/youtube/feed";

// Facade pattern: solo se muestra la miniatura; el iframe de YouTube se carga
// hasta que el lector da clic, así la portada no carga nada de YouTube.
export default function VideoCard({ video }: { video: YouTubeVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative aspect-video bg-primary">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Reproducir: ${video.title}`}
            className="group absolute inset-0 w-full h-full cursor-pointer"
          >
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-gold/95 group-hover:bg-gold flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary ml-0.5" fill="currentColor">
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-foreground leading-snug line-clamp-2">
          {video.title}
        </h3>
        {video.publishedAt && (
          <time className="block text-xs text-muted-light mt-2">
            {new Date(video.publishedAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        )}
      </div>
    </div>
  );
}
