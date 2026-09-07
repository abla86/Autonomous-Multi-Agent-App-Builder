/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LogoDesigner } from "./components/LogoDesigner";
import { LogoAnimator } from "./components/LogoAnimator";
import { PictureToVideo } from "./components/PictureToVideo";
import { GalleryHistory } from "./components/GalleryHistory";
import { ActiveTab, GeneratedLogo, GeneratedVideo } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("logo-designer");
  const [savedLogos, setSavedLogos] = useState<GeneratedLogo[]>(() => {
    try {
      const stored = localStorage.getItem("app_saved_logos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedVideos, setSavedVideos] = useState<GeneratedVideo[]>(() => {
    try {
      const stored = localStorage.getItem("app_saved_videos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentLogo, setCurrentLogo] = useState<GeneratedLogo | null>(() => {
    return savedLogos.length > 0 ? savedLogos[0] : null;
  });

  const [initialImageForVideo, setInitialImageForVideo] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("app_saved_logos", JSON.stringify(savedLogos));
    } catch (e) {
      console.warn("Could not persist logos to localStorage:", e);
    }
  }, [savedLogos]);

  useEffect(() => {
    try {
      localStorage.setItem("app_saved_videos", JSON.stringify(savedVideos));
    } catch (e) {
      console.warn("Could not persist videos to localStorage:", e);
    }
  }, [savedVideos]);

  const handleLogoGenerated = (logo: GeneratedLogo) => {
    setCurrentLogo(logo);
    setSavedLogos((prev) => [logo, ...prev.filter((l) => l.id !== logo.id)]);
  };

  const handleAnimateLogo = (logo: GeneratedLogo) => {
    setCurrentLogo(logo);
    setActiveTab("logo-animator");
  };

  const handleConvertToVideo = (logo: GeneratedLogo) => {
    setInitialImageForVideo(logo.imageUrl);
    setActiveTab("picture-to-video");
  };

  const handleVideoGenerated = (video: GeneratedVideo) => {
    setSavedVideos((prev) => [video, ...prev.filter((v) => v.id !== video.id)]);
  };

  const handleDeleteLogo = (id: string) => {
    setSavedLogos((prev) => prev.filter((l) => l.id !== id));
    if (currentLogo?.id === id) {
      setCurrentLogo(savedLogos.find((l) => l.id !== id) || null);
    }
  };

  const handleDeleteVideo = (id: string) => {
    setSavedVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col font-sans selection:bg-[#FF3B00] selection:text-black">
      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        logoCount={savedLogos.length}
        videoCount={savedVideos.length}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === "logo-designer" && (
          <LogoDesigner
            onLogoGenerated={handleLogoGenerated}
            onAnimateLogo={handleAnimateLogo}
            onConvertToVideo={handleConvertToVideo}
          />
        )}

        {activeTab === "logo-animator" && (
          <LogoAnimator
            currentLogo={currentLogo}
            savedLogos={savedLogos}
            onSelectLogo={(logo) => setCurrentLogo(logo)}
            onVideoGenerated={handleVideoGenerated}
          />
        )}

        {activeTab === "picture-to-video" && (
          <PictureToVideo
            initialImage={initialImageForVideo || currentLogo?.imageUrl || null}
            savedLogos={savedLogos}
            onVideoGenerated={handleVideoGenerated}
          />
        )}

        {activeTab === "gallery" && (
          <GalleryHistory
            savedLogos={savedLogos}
            savedVideos={savedVideos}
            onSelectLogo={(logo) => {
              setCurrentLogo(logo);
              setActiveTab("logo-animator");
            }}
            onSelectVideo={() => {
              setActiveTab("picture-to-video");
            }}
            onDeleteLogo={handleDeleteLogo}
            onDeleteVideo={handleDeleteVideo}
          />
        )}
      </main>

      {/* Artistic Flair Telemetry Footer */}
      <footer className="h-12 bg-[#0A0A0A] border-t border-[#222] flex items-center px-4 sm:px-10 text-[10px] font-mono opacity-60">
        <div className="flex gap-6 sm:gap-10 items-center w-full">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="uppercase tracking-widest text-[#F0F0F0]">System Ready: AI Core v4</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-white/40">
            <span>GEMINI 3 PRO</span>
            <span>•</span>
            <span>VEO 3.1 FAST</span>
          </div>
          <div className="ml-auto flex gap-4 sm:gap-6 text-white/50 tracking-wider">
            <span>STATUS: OPTIMAL</span>
            <span className="hidden md:inline">CHOREOGRAPHY: 60FPS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
