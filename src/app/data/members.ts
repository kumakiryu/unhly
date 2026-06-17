export type Status = "online" | "idle" | "dnd" | "offline";
export type SocialPlatform = "discord" | "instagram" | "tiktok" | "twitter" | "youtube" | "kick" | "spotify" | "steam" | "twitch";
export type BgType = "image" | "video";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Member {
  slug: string;
  name: string;
  featured: boolean;
  discordId: string;
  status: Status;
  avatar: string;
  bio: string;
  tagline: string;
  music: string;
  musicTitle: string;
  musicArtist: string;
  musicCoverUrl?: string;
  musicStartTime?: number;
  bgUrl?: string;
  bgType?: BgType;
  
  badgeBgUrl?: string;     // 👈 ADD THIS
  badgeBgType?: BgType;    // 👈 optional (image/video)

  
  socialLinks: SocialLink[];
}

export const members: Member[] = [
  {
    slug: "reikugo",
    name: "Keian",
    featured: true,
    discordId: "711906191634333788",
    status: "offline",
    avatar: "https://www.pinterest.com/sydneyjayne19/twitter-pfp-aesthetic/",
    bio: "HEAVENSENT.",
    tagline: "Building something real.",
    music: "https://kumakiryu.github.io/musics-forunhoely/assets/knunhoelymusic.mp3",
    musicTitle: "One of The Girls",
    musicArtist: "The Weeknd",
    musicCoverUrl: "https://upload.wikimedia.org/wikipedia/en/2/2c/One_of_the_Girls_-_The_Weeknd%2C_Jennie%2C_%26_Lily-Rose_Depp.jpg",
    musicStartTime: 0,
    bgUrl: "https://kumakiryu.github.io/musics-forunhoely/assets/backgrounds/knbg.png",
    bgType: "image",
    badgeBgUrl: "https://raw.githubusercontent.com/kumakiryu/unhoely-assets/main/assets/wotext.png",
    badgeBgType: "video",
    socialLinks: [
      { platform: "tiktok", url: "https://www.tiktok.com/@reikugo" },
      { platform: "youtube", url: "https://www.youtube.com/@Reikugo" },
      { platform: "twitch", url: "https://www.twitch.tv/reikugo" },
    ],
  },
  {
    slug: "charm",
    name: "Charm",
    featured: true,
    discordId: "1007877981215137834",
    status: "offline",
    avatar: "https://www.pinterest.com/sydneyjayne19/twitter-pfp-aesthetic/",
    bio: "eaboo worlwide",
    tagline: "Building something real.",
    music: "https://kumakiryu.github.io/musics-forunhoely/assets/charmunhoelymusic.mp3",
    musicTitle: "Cinderella (feat. Ty Dolla Sign)",
    musicArtist: "Mac Miller",
    musicCoverUrl: "https://i.scdn.co/image/ab67616d0000b2732e92f776279eaf45d14a33fd",
    musicStartTime: 0,
    bgUrl: "https://kumakiryu.github.io/musics-forunhoely/assets/backgrounds/charmbg.gif",
    bgType: "image",
    badgeBgUrl: "https://raw.githubusercontent.com/kumakiryu/unhoely-assets/main/assets/wotext.png",
    badgeBgType: "image",
    socialLinks: [
      { platform: "tiktok", url: "https://www.tiktok.com/@eggiebumbum?_r=1&_t=ZS-978wlNbjmdQ" },
      { platform: "youtube", url: "https://youtube.com/@notyourcharm?si=rRtHAFbtsT_h-1sD" },
      { platform: "kick", url: "https://kick.com/charmierae" },
    ],
  },
  {
    slug: "irxs",
    name: "Irxs",
    featured: false,
    discordId: "712662013649879062",
    status: "offline",
    avatar: "https://www.pinterest.com/sydneyjayne19/twitter-pfp-aesthetic/",
    bio: "LIBR4",
    tagline: "Building something real.",
    music: "https://kumakiryu.github.io/musics-forunhoely/assets/iwxsunhoelymusic.mp3",
    musicTitle: "xcl$v4u",
    musicArtist: "LIBR4",
    musicCoverUrl: "https://cdn.discordapp.com/attachments/549417978047758359/1515639291005374596/image.png?ex=6a2fbc96&is=6a2e6b16&hm=1a492e5493e516bc92aea8dc80d18eedb551d928be918e8c6659a12372f76ffb&animated=true",
    musicStartTime: 0,
    bgUrl: "https://kumakiryu.github.io/musics-forunhoely/assets/backgrounds/iwxsbg.mp4",
    bgType: "video",
    badgeBgUrl: "https://raw.githubusercontent.com/kumakiryu/unhoely-assets/main/assets/wotext.png",
    badgeBgType: "image",
    socialLinks: [
      { platform: "tiktok", url: "https://www.tiktok.com/@defnotlibr4?is_from_webapp=1&sender_device=pc" },
      { platform: "youtube", url: "https://youtube.com/@libr4xx?si=pMuBGnN9Ds-4kqU3" },
    ],
  },
  {
    slug: "mika",
    name: "Mika",
    featured: false,
    discordId: "1227221233570152524",
    status: "offline",
    avatar: "https://www.pinterest.com/sydneyjayne19/twitter-pfp-aesthetic/",
    bio: "TOYOIN",
    tagline: "Building something real.",
    music: "https://kumakiryu.github.io/musics-forunhoely/assets/mikaunhoelymusic.mp3",
    musicTitle: "Please Don't Fall in Love With Me",
    musicArtist: "Khalid",
    musicCoverUrl: "https://i.scdn.co/image/ab67616d0000b2730a50830179e52a80cbc8d54e",
    musicStartTime: 0,
    bgUrl: "https://kumakiryu.github.io/musics-forunhoely/assets/backgrounds/mikabg.gif",
    bgType: "image",
    badgeBgUrl: "https://raw.githubusercontent.com/kumakiryu/unhoely-assets/main/assets/wotext.png",
    badgeBgType: "image",
    socialLinks: [
    ],
  },
    {
    slug: "ellawtf",
    name: "Ella",
    featured: false,
    discordId: "406855154625806336",
    status: "offline",
    avatar: "https://www.pinterest.com/sydneyjayne19/twitter-pfp-aesthetic/",
    bio: "Yours Truly.",
    tagline: "Building something real.",
    music: "https://kumakiryu.github.io/musics-forunhoely/assets/ellaunhoelymusic.mp3",
    musicTitle: "Me & U",
    musicArtist: "Cassie",
    musicCoverUrl: "https://i1.sndcdn.com/artworks-BapnnYN8Mvdki1OX-CHguSg-t500x500.jpg",
    musicStartTime: 0,
    bgUrl: "https://kumakiryu.github.io/musics-forunhoely/assets/backgrounds/ellabg.mov",
    bgType: "video",
    badgeBgUrl: "https://raw.githubusercontent.com/kumakiryu/unhoely-assets/main/assets/wotext.png",
    badgeBgType: "image",
    socialLinks: [
      { platform: "spotify", url: "https://open.spotify.com/user/thatsoari25" },
      { platform: "youtube", url: "https://www.youtube.com/@ellawtff" },
    ],
  },
      {
    slug: "rxra",
    name: "Rora",
    featured: false,
    discordId: "702583076706058240",
    status: "offline",
    avatar: "https://www.pinterest.com/sydneyjayne19/twitter-pfp-aesthetic/",
    bio: "STICKWITU.",
    tagline: "Building something real.",
    music: "https://kumakiryu.github.io/musics-forunhoely/assets/roraunhoelymusic.mp3",
    musicTitle: "Stickwitu",
    musicArtist: "The Pussycat Dolls",
    musicCoverUrl: "https://i.scdn.co/image/ab67616d00001e0279e3c5d19025dde165d2df13",
    musicStartTime: 0,
    bgUrl: "https://kumakiryu.github.io/musics-forunhoely/assets/backgrounds/rorabg.mp4",
    bgType: "video",
    badgeBgUrl: "https://raw.githubusercontent.com/kumakiryu/unhoely-assets/main/assets/wotext.png",
    badgeBgType: "image",
    socialLinks: [
      { platform: "spotify", url: "https://open.spotify.com/user/31il7ocalsebgfdg6zvrk6ugx3si" },
      { platform: "youtube", url: "https://www.youtube.com/@rxradvl" },
    ],
  },
];

export const featuredMembers = members.filter((m) => m.featured);
export const regularMembers = members.filter((m) => !m.featured);
