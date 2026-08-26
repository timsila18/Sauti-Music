export type DiscoverySong={id:string;slug:string;title:string;artist:string;artistHandle:string;artistId:string;genre:string;releaseDate:string;accent:"coral"|"plum"|"lime"|"lavender";activity:string;externalLinks?:Partial<Record<"YouTube"|"Spotify"|"Apple Music"|"Mdundo",string>>};
export type PublicProfile={id:string;handle:string;name:string;kind:"ARTIST"|"DJ"|"MATATU";subtitle:string;bio:string;genres:string[];location:string;verified:boolean;accent:DiscoverySong["accent"]};

const artistAmani="30000000-0000-0000-0000-000000000002";
export const discoverySongs:DiscoverySong[]=[
 {id:"60000000-0000-0000-0000-000000000006",slug:"nairobi-nights",title:"Nairobi Nights",artist:"Amani Vale",artistHandle:"amani_vale",artistId:artistAmani,genre:"Afropop",releaseDate:"22 Aug 2026",accent:"coral",activity:"Rising in Nairobi this week"},
 {id:"60000000-0000-0000-0000-000000000002",slug:"mtaa-motion",title:"Mtaa Motion",artist:"The Akili Collective",artistHandle:"akili_records",artistId:"30000000-0000-0000-0000-000000000001",genre:"Gengetone",releaseDate:"4 Jul 2026",accent:"plum",activity:"A favourite on participating matatus"},
 {id:"60000000-0000-0000-0000-000000000003",slug:"coastline",title:"Coastline",artist:"Zuri Mwende",artistHandle:"zuri_mwende",artistId:"30000000-0000-0000-0000-000000000003",genre:"Afrofusion",releaseDate:"1 Aug 2026",accent:"lime",activity:"Moving between Mombasa and Nairobi"},
 {id:"60000000-0000-0000-0000-000000000004",slug:"back-home",title:"Back Home",artist:"Amani Vale",artistHandle:"amani_vale",artistId:artistAmani,genre:"Afropop",releaseDate:"8 Aug 2026",accent:"lavender",activity:"Saved by listeners around Kilimani"},
 {id:"60000000-0000-0000-0000-000000000005",slug:"sunday-energy",title:"Sunday Energy",artist:"Mali K",artistHandle:"mtaa_collective",artistId:"30000000-0000-0000-0000-000000000004",genre:"Amapiano",releaseDate:"15 Aug 2026",accent:"coral",activity:"Popular with Sauti DJs"},
 {id:"60000000-0000-0000-0000-000000000001",slug:"nairobi-after-dark",title:"Nairobi After Dark",artist:"Kendi Amani",artistHandle:"akili_records",artistId:"30000000-0000-0000-0000-000000000001",genre:"Afropop",releaseDate:"12 Jun 2026",accent:"plum",activity:"Heard on the CBD – Umoja route"},
];
export const publicProfiles:PublicProfile[]=[
 {id:artistAmani,handle:"amani_vale",name:"Amani Vale",kind:"ARTIST",subtitle:"Afropop artist",bio:"Warm city pop made in Nairobi.",genres:["Afropop","R&B"],location:"Kilimani, Nairobi",verified:true,accent:"coral"},
 {id:"30000000-0000-0000-0000-000000000003",handle:"zuri_mwende",name:"Zuri Mwende",kind:"ARTIST",subtitle:"Afrofusion artist",bio:"Coastal melodies, bright guitars and honest stories.",genres:["Afrofusion","Swahili pop"],location:"Mombasa",verified:true,accent:"lime"},
 {id:"40000000-0000-0000-0000-000000000001",handle:"dj_mura",name:"DJ Mura",kind:"DJ",subtitle:"Open-format DJ",bio:"Nairobi nights, new Kenyan music and room-moving sets.",genres:["Afropop","Gengetone","Amapiano"],location:"Kasarani, Nairobi",verified:true,accent:"lavender"},
 {id:"50000000-0000-0000-0000-000000000001",handle:"niaje_254",name:"Niaje 254",kind:"MATATU",subtitle:"CBD – Umoja",bio:"Big hooks, hometown favourites and new Eastlands energy.",genres:["Gengetone","Afropop","Hip-hop"],location:"Umoja, Nairobi",verified:true,accent:"plum"},
];

export const chartViews={"Near Me":discoverySongs.slice(0,5),Nairobi:[discoverySongs[0],discoverySongs[5],discoverySongs[1],discoverySongs[3],discoverySongs[4]],Matatus:[discoverySongs[1],discoverySongs[5],discoverySongs[4],discoverySongs[0],discoverySongs[2]],DJs:[discoverySongs[4],discoverySongs[0],discoverySongs[2],discoverySongs[3],discoverySongs[1]],"New Music":[discoverySongs[0],discoverySongs[4],discoverySongs[3],discoverySongs[2],discoverySongs[1]]};
export const discoverySections=[
 {title:"Trending Now",items:discoverySongs.slice(0,4)},
 {title:"New Kenyan Music",items:[discoverySongs[0],discoverySongs[4],discoverySongs[3],discoverySongs[2]]},
 {title:"Rising Near You",items:[discoverySongs[3],discoverySongs[0],discoverySongs[5],discoverySongs[1]]},
 {title:"Popular With DJs",items:[discoverySongs[4],discoverySongs[2],discoverySongs[0],discoverySongs[1]]},
 {title:"Matatu Favourites",items:[discoverySongs[1],discoverySongs[5],discoverySongs[4],discoverySongs[0]]},
 {title:"Sauti Picks",items:[discoverySongs[2],discoverySongs[0],discoverySongs[3],discoverySongs[5]]},
];
export const activityItems=["Amani Vale released Nairobi Nights.","DJ Mura is supporting new Kenyan music.","Niaje 254 is active on Sauti.","A song you saved is rising in Nairobi."];
export function songBySlug(value:string){return discoverySongs.find(song=>song.slug===value||song.id===value);}
export function profileByHandle(value:string){return publicProfiles.find(profile=>profile.handle===value);}
