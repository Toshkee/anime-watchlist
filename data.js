const defaultAnimesData = [
        {
            title: "One Piece",
            image: "onepiece.jpg",
            description:
                "Set sail on the Grand Line with the adventurous young pirate Monkey D. Luffy and his rag-tag crew of dreamers known as the Straw Hat Pirates. When Luffy eats a mysterious Devil Fruit that turns his body into rubber, he inherits his idol’s iconic straw hat — and a bold ambition: to find the legendary treasure “One Piece” and claim the title of Pirate King. Along the way, the Straw Hats chart unknown seas, face ruthless marines, outwit powerful rivals, and uncover the deep secrets of a vast world built on freedom, friendship, and the courage to stand up for one’s dreams.",
            genre: "Action, Adventure, Fantasy",
            episodes: "1000+"
        },
        {
            title: "Hunter x Hunter",
            image: "HunterxHunter.jpg",
            description:
                "Set out on a gripping adventure with twelve-year-old Gon Freecss after he discovers that the father he believed dead is actually alive — and not only alive, but a legendary “Hunter,” an elite adventurer licensed to take on the world’s greatest quests. Determined to follow in his father’s footsteps, Gon embarks on the arduous Hunter Exam, forging powerful friendships with Killua, Kurapika and Leorio while navigating deadly trials, nefarious organizations and a mysterious power known as Nen. Built on heart-pounding battles, moral dilemmas and emotional growth, the series pushes beyond typical shōnen fare to explore ambition, sacrifice and the price of strength.",
            genre: "Adventure, Fantasy, Action",
            episodes: "148"
        },
        {
            title: "Demon Slayer",
            image: "demonslayer.jpg",
            description:
                "In Taishō-era Japan, kind-hearted young charcoal seller Tanjiro Kamado sees his life shattered when demons massacre his family and his sister Nezuko is transformed into one of their kind. Determined to restore his sister’s humanity and avenge his loved ones, Tanjiro joins the Demon Slayer Corps, mastering the deadly Breathing Techniques and forging unbreakable bonds with fellow warriors Zenitsu and Inosuke. As they face nightmarish foes and uncover the horrors that lurk beyond the night, their battle becomes more than survival—it becomes a fight for hope, redemption and the strength found in humanity’s light.",
            genre: "Action, Supernatural, Historical",
            episodes: "55"
        },
        {
            title: "Naruto",
            image: "naruto.jpg",
            description:
                "Orphaned outcast Naruto Uzumaki dreams of becoming the strongest ninja and earning the title of Hokage. But with the Nine-Tails Fox sealed inside him, he faces fear and rejection from his own village. Through endless perseverance, unbreakable friendships, and heart-pounding battles, Naruto learns that true strength comes from empathy, hard work, and never giving up on one’s dreams.",
            genre: "Action, Adventure, Shounen",
            episodes: "220"
        },
        {
            title: "Monster",
            image: "monster.jpg",
            description:
                "Brilliant neurosurgeon Dr. Kenzo Tenma saves the life of a young boy over a prominent politician — only to realize years later that the boy has grown into a remorseless killer. As bodies pile up, Tenma descends into a psychological nightmare across Europe, haunted by guilt, morality, and the terrifying question: who is the real monster?",
            genre: "Thriller, Psychological, Mystery",
            episodes: "74"
        },
        {
            title: "Black Clover",
            image: "blackclover.jpg",
            description:
                "In a world where magic defines status, Asta is born without any magical power — yet he refuses to give up on his dream of becoming the Wizard King. Alongside his rival and foster brother Yuno, Asta pushes beyond his limits in a thrilling story of rivalry, courage, and destiny.",
            genre: "Action, Fantasy, Adventure",
            episodes: "170"
        },
        {
            title: "Bleach",
            image: "bleach.jpg",
            description:
                "After accidentally obtaining the powers of a Soul Reaper, Ichigo Kurosaki must protect the living from evil spirits and guide lost souls to peace. But as he dives deeper into the afterlife’s conflicts, Ichigo discovers secrets that threaten the balance of all worlds.",
            genre: "Action, Supernatural, Adventure",
            episodes: "366 + ongoing (TYBW arc)"
        },
        {
            title: "Dragon Ball",
            image: "dragonball.jpg",
            description:
                "Follow the journey of Goku, a cheerful boy with a monkey tail and boundless strength, as he trains in martial arts, seeks out the mystical Dragon Balls, and protects Earth from powerful foes. A cornerstone of anime history, Dragon Ball combines humor, heart, and epic battles that inspired generations.",
            genre: "Action, Adventure, Comedy",
            episodes: "153"
        },
        {
            title: "Code Geass",
            image: "codegeass.jpg",
            description:
                "In an alternate future ruled by the Holy Britannian Empire, exiled prince Lelouch gains a mysterious power known as Geass — the ability to command anyone to obey his orders. Masked as the vigilante Zero, he leads a revolution to destroy the empire from within, torn between justice, vengeance, and morality.",
            genre: "Mecha, Drama, Sci-Fi, Psychological",
            episodes: "50"
        },
        {
            title: "Neon Genesis Evangelion",
            image: "evangelion.jpg",
            description:
                "In a post-apocalyptic Tokyo besieged by monstrous beings known as Angels, young Shinji Ikari is forced to pilot a giant bio-mechanical weapon to protect humanity. But as the line between man and machine blurs, Evangelion explores the darkest corners of depression, identity, and the human soul.",
            genre: "Mecha, Psychological, Drama",
            episodes: "26"
        },
        {
            title: "Cowboy Bebop",
            image: "cowboybebop.jpg",
            description:
                "In the year 2071, a crew of space bounty hunters drifts through the galaxy chasing criminals — and their own pasts. With its slick jazz soundtrack, stylish visuals, and deep emotional storytelling, Cowboy Bebop redefined anime as a cinematic art form.",
            genre: "Action, Sci-Fi, Drama",
            episodes: "26"
        },
        {
            title: "Death Note",
            image: "deathnote.jpg",
            description:
                "When high school genius Light Yagami finds a mysterious notebook that kills anyone whose name is written inside, he decides to cleanse the world of evil. But as detective L closes in, a deadly psychological game begins — a battle of intellect and morality where every move could be fatal.",
            genre: "Thriller, Psychological, Mystery",
            episodes: "37"
        },
        {
            title: "Berserk",
            image: "berserk.jpg",
            description:
                "Haunted by betrayal and driven by vengeance, mercenary Guts cuts through a brutal medieval world filled with corruption, demons, and destiny. Berserk is a dark masterpiece exploring trauma, loyalty, and the cost of ambition — a tragic tale of a man struggling against fate itself.",
            genre: "Action, Dark Fantasy, Drama",
            episodes: "25 (1997) + Films"
        },
        {
            title: "JoJo's Bizarre Adventure",
            image: "jojo.jpg",
            description:
                "Spanning generations, the Joestar family faces supernatural foes in a saga defined by its flamboyant style, creative battles, and unforgettable characters. From vampires to Stands, JoJo’s Bizarre Adventure is equal parts absurd, heroic, and brilliant — a genre-defying celebration of imagination.",
            genre: "Action, Adventure, Supernatural",
            episodes: "190+"
        },
        {
            title: "Attack on Titan",
            image: "aot.jpg",
            description:
                "In a world overrun by man-eating Titans, humanity hides behind colossal walls. When a devastating attack shatters that safety, young Eren Yeager vows to eradicate every Titan — but his quest uncovers horrifying truths about freedom, war, and what it means to be human.",
            genre: "Action, Drama, Mystery",
            episodes: "87"
        },
        {
            title: "Vinland Saga",
            image: "vinlandsaga.jpg",
            description:
                "In Viking-era Europe, young Thorfinn seeks revenge against the man who killed his father — but his journey leads him to question the true meaning of strength, honor, and peace. A stunning historical epic that explores violence and redemption with emotional depth.",
            genre: "Action, Historical, Drama",
            episodes: "48"
        },
        {
            title: "Hajime no Ippo",
            image: "ippohajime.jpg",
            description:
                "Bullied teenager Ippo Makunouchi discovers boxing and finds a new sense of purpose through grit, discipline, and courage. Through intense rivalries and emotional victories, Ippo’s rise from underdog to champion embodies the true spirit of perseverance.",
            genre: "Sports, Drama, Comedy",
            episodes: "76"
        },
        {
            title: "Jujutsu Kaisen",
            image: "jujutsukaisen.jpg",
            description:
                "Yuji Itadori, a kind-hearted teenager, swallows a cursed object containing a powerful demon — and becomes its unwilling host. Enrolled in the world of Jujutsu Sorcery, Yuji must master deadly techniques to exorcise curses and uncover a dark conspiracy that threatens all of humanity.",
            genre: "Action, Supernatural, Dark Fantasy",
            episodes: "47+"
        },
        {
            title: "Haikyu",
            image: "haikyu.jpg",
            description:
                "Inspired by a volleyball prodigy, determined short-statured student Shoyo Hinata joins his high school team and faces off against towering opponents. Fueled by teamwork and passion, Haikyu celebrates competition, friendship, and the love of the game.",
            genre: "Sports, Comedy, Drama",
            episodes: "85"
        },
        {
            title: "Pokemon",
            image: "pokemon.jpg",
            description:
                "Join Ash Ketchum and his loyal Pikachu as they travel across regions capturing Pokémon, battling trainers, and chasing the dream of becoming a Pokémon Master. Filled with adventure, heart, and friendship, Pokémon is a timeless journey of growth and discovery.",
            genre: "Adventure, Fantasy, Family",
            episodes: "1200+"
        }
    ];

    module.exports = defaultAnimesData;