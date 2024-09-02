<template>
    <div class="page-404">
        <h1 class="page-404-title">
            <!-- {{title}} -->
        <Glitch 
            :inputs="[title]"
            :options="{
                accentColor: 'var(--red)',
                duration: 0,
                hover: true,
            }"
            />
        </h1>

        <div class="layer2">
            <Glitch 
                v-for="(inputs, key) in layer2glitchInputs"
                :inputs="inputs"
                :key="key"
                :options="{
                    accentColor: 'var(--red)',
                    hover: true,
                    duration: Math.random()*6400 + 1600
                }"
                :style="{
                    fontWeight: Math.random() * 900,
                    fontStretch: `${Math.random() * 55 + 55}%`
                }"
                />
        </div>

        <Glitch 
            v-for="(inputs, key) in glitchInputs"
            :inputs="inputs"
            :key="key"
            :options="{
                accentColor: 'var(--red)',
                hover: true,
                duration: Math.random()*6400 + 1600
            }"
            :style="{
                fontWeight: Math.random() * 900,
                fontStretch: `${Math.random() * 55 + 55}%`
            }"
            />
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import { useRoute } from "vue-router"
import payloadStore from "@/stores/payload"
import gsap from "gsap"
import Glitch from "./../components/glitch.vue"
import { useHead }  from "@unhead/vue"

export default defineComponent ({ 
    name: "errorPage404",
    components: { 
        Glitch
    },
    props: [],
    setup() {
        const Payload = payloadStore()
        const route = useRoute()
        const title = route.name as string

       
        return { 
            Payload,
            head:  useHead({
                title: `${title} - Not found`,
            }) 
        }
    },
    data() {
        return {
            title: "404 not found",
            messages: [
                "Error 404",
                "404",
                "Page not found",
                "404 Error",
                "Not Found",
                "Page Missing",
                "Oops! Page not found",
                "Aie! Page not found",
                "We can't find that page",
                "404: Page does not exist",
                "This page isn't available",
                "Page unavailable",
                "Lost in cyberspace",
                "Hmmmm... I can't find this page",
                "This page got lost in cyberspace",
                "The page has vanished",
                "404: Page not here",
                "Page gone missing",
                "404: We couldn't find that",
                "Oops! This page got lost somewhere",
                "This link is broken",
                "Dead link: 404",
                "404: Not here",
                "The requested URL was not found"
            ],
            layer2glitchInputs: [] as Array<Array<string>>,
            glitchInputs: [] as Array<Array<string>>
        }
    },
    head: { 
        title: "Home",
        meta: [
            {
                name: "description",
                content: "Lorem ipsum dolor samet...",
            },
        ]
    },
    beforeMount() {
        this.glitchInputs = this.fillGlitchInputs(80)
        this.layer2glitchInputs = this.fillGlitchInputs(80)
        this.title = this.getRandomMessage()
    },
    mounted() {

        // Animation for Title block
        gsap.fromTo("h1", {
            fontWeight: 400,
            fontStretch: 80,
        },{
            fontWeight: 800,
            fontStretch: 100,
            ease:"bounce.out",
            duration: .8 
        })
    },
    methods: {
        fillGlitchInputs(amount: number) {
            const res = []
            for (let index = 0; index < amount; index++) {
                res.push([
                    this.regenerateString(this.getRandomMessage()),
                    this.regenerateString(this.getRandomMessage())
                ])
            }
            return res
        },
        getRandomMessage(): string {
            return this.messages[Math.floor(Math.random() * this.messages.length)]
        },
        regenerateString(string: string): string {
            const arr = string.toLocaleLowerCase().split("")
            const list = {
                a: ["a","@", "ɑ","α","а","⍺","𝐚","𝑎","𝒂","𝒶","𝓪","𝔞","𝕒","𝖆","𝖺","𝗮","𝘢","𝙖","𝚊","𝛂","𝛼","𝜶","𝝰","𝞪","A", " ͣ"],
                b: ["b","Ƅ","Ь","Ꮟ","ᑲ","ᖯ","𝐛","𝑏","𝒃","𝒷","𝓫","𝔟","𝕓","𝖇","𝖻","𝗯","𝘣","𝙗","𝚋", "B",],
                c: ["c", "ϲ", "с", "ᴄ", "ⅽ", "ⲥ", "ꮯ", "𐐽", "𝐜", "𝑐", "𝒄", "𝒸", "𝓬", "𝔠", "𝕔", "𝖈", "𝖼", "𝗰", "𝘤", "𝙘", "𝚌", "ｃ", " ͨ"],
                d: ["d", "ԁ", "Ꮷ", "ᑯ", "ⅆ", "ⅾ", "ꓒ", "𝐝", "𝑑", "𝒅", "𝒹", "𝓭", "𝔡", "𝕕", "𝖉", "𝖽", "𝗱", "𝘥", "𝙙", "𝚍", " ͩ"],
                e: ["e", "е", "ҽ", "℮", "ℯ", "ⅇ", "€", "E", "ë", "ę", "ͤ"],
                f: ["f", "ſ", "ք", "ẝ",  "𝐟", "𝑓", "𝒇", "𝒻", "𝓯", "𝔣", "𝕗", "𝖋", "𝖿", "𝗳", "𝘧", "𝙛", "𝚏"],
                g: ["g", "ƍ", "ɡ", "ց", "ᶃ", "ℊ", "𝐠", "𝑔", "𝒈", "𝓰", "𝔤", "𝕘", "𝖌", "𝗀", "𝗴", "𝘨", "𝙜", "𝚐", "ｇ"],
                h: ["h", "һ", "հ", "Ꮒ", "ℎ", "𝐡", "𝒉", "𝒽", "𝓱", "𝔥", "𝕙", "𝖍", "𝗁", "𝗵", "𝘩", "𝙝", "𝚑", "ｈ"],
                i: ["i", "ı", "ɩ", "ɪ", "і", "ӏ", "Ꭵ", "ι", "ℹ", "ⅈ", "ⅰ", "⍳", "ꙇ", "ꭵ", "𑣃", "𝐢", "𝑖", "𝒊", "𝒾", "𝓲", "𝔦", "𝕚", "𝖎", "𝗂", "𝗶", "𝘪", "𝙞", "𝚒", "𝚤", "𝛊", "𝜄", "𝜾", "𝝸", "𝞲", "ｉ"],
                j: ["j", "ϳ", "ј", "ⅉ", "𝐣", "𝑗", "𝒋", "𝒿", "𝓳", "𝔧", "𝕛", "𝖏", "𝗃", "𝗷", "𝘫", "𝙟", "𝚓", "ｊ"],
                k: ["k", "𝐤", "𝑘", "𝒌", "𝓀", "𝓴", "𝔨", "𝕜", "𝖐", "𝗄", "𝗸", "𝘬", "𝙠", "𝚔", " K"],
                l: ["l", "I", "l", "|", "ι", "Ɩ", "ǀ", "Ι", "І", "Ӏ", "׀", "ו", "ן", "ا", "ߊ", "ᛁ", "ℐ", "ℑ", "ℓ", "Ⅰ", "ⅼ", "∣", "⏽", "Ⲓ", "ⵏ", "ꓲ", "𐊊", "𐌉", "𐌠", "𖼨", "𝐈", "𝐥", "𝐼", "𝑙", "𝑰", "𝒍", "𝓁", "𝓘", "𝓵", "𝔩", "𝕀", "𝕝", "𝕴", "𝖑", "𝖨", "𝗅", "𝗜", "𝗹", "𝘐", "𝘭", "𝙄", "𝙡", "𝙸", "𝚕", "𝚰", "𝛪", "𝜤", "𝝞", "𝞘", "𞣇", "ﺍ", "ﺎ", "Ｉ", "ｌ", "￨"],
                m: ["m", "rn", "ⅿ", "𑜀", "𑣣", "𝐦", "𝑚", "𝒎", "𝓂", "𝓶", "𝔪", "𝕞", "𝖒", "𝗆", "𝗺", "𝘮", "𝙢", "𝚖"],
                n: ["n", "ո", "ռ", "𝐧", "𝑛", "𝒏", "𝓃", "𝓷", "𝔫", "𝕟", "𝖓", "𝗇", "𝗻", "𝘯", "𝙣", "𝚗"],
                o: ["o", "ο", "σ", "о", "օ", "ס", "ه", "٥", "ھ", "ہ", "ە", "۵", "०", "੦", "૦", "௦", "ం", "౦", "ಂ", "೦", "ം", "ഠ", "൦", "ං", "๐", "໐", "ဝ", "၀", "ჿ", "ᴏ", "ᴑ", "ℴ", "ⲟ", "𐐬", "𐓪", "𑣈", "𑣗", "𝐨", "𝑜", "𝒐", "𝓸", "𝔬", "𝕠", "𝖔", "𝗈", "𝗼", "𝘰", "𝙤", "𝚘", "𝛐", "𝛔", "𝜊", "𝜎", "𝝄", "𝝈", "𝝾", "𝞂", "𝞸", "𝞼", "ｏ"],
                p: ["p", "ρ", "ϱ", "р", "⍴", "ⲣ", "𝐩", "𝑝", "𝒑", "𝓅", "𝓹", "𝔭", "𝕡", "𝖕", "𝗉", "𝗽", "𝘱", "𝙥", "𝚙", "𝛒", "𝛠", "𝜌", "𝜚", "𝝆", "𝝔", "𝞀", "𝞎", "𝞺", "𝟈", "ｐ"],
                q: ["q", "ԛ", "գ", "զ", "𝐪", "𝑞", "𝒒", "𝓆", "𝓺", "𝔮", "𝕢", "𝖖", "𝗊", "𝗾", "𝘲", "𝙦", "𝚚"],
                r: ["r", "г", "ᴦ", "ⲅ", "ꮁ", "𝐫", "𝑟", "𝒓", "𝓇", "𝓻", "𝔯", "𝕣", "𝖗", "𝗋", "𝗿", "𝘳", "𝙧", "𝚛", "Ꝛ"],
                s: ["s", "ƽ", "ѕ", "ꜱ", "ꮪ", "𐑈", "𑣁", "𝐬", "𝑠", "𝒔", "𝓈", "𝓼", "𝔰", "𝕤", "𝖘", "𝗌", "𝘀", "𝘴", "𝙨", "𝚜", "ｓ"],
                t: ["t", "𝐭", "𝑡", "𝒕", "𝓉", "𝓽", "𝔱", "𝕥", "𝖙", "𝗍", "𝘁", "𝘵", "𝙩", "𝚝"],
                u: ["u", "ʋ", "υ", "ս", "ᴜ", "𐓶", "𑣘", "𝐮", "𝑢", "𝒖", "𝓊", "𝓾", "𝔲", "𝕦", "𝖚", "𝗎", "𝘂", "𝘶", "𝙪", "𝚞", "𝛖", "𝜐", "𝝊", "𝞄", "𝞾"],
                v: ["v", "V","\/", "v", "ν", "ѵ", "ט", "ᴠ", "ⅴ", "∨", "⋁", "ꮩ", "𑜆", "𑣀", "𝐯", "𝑣", "𝒗", "𝓋", "𝓿", "𝔳", "𝕧", "𝖛", "𝗏", "𝘃", "𝘷", "𝙫", "𝚟", "𝛎", "𝜈", "𝝂", "𝝼", "𝞶", "ｖ"],
                w: ["w", "W", "w", "ɯ", "ѡ", "ԝ", "ա", "ᴡ", "ꮃ", "𑜊", "𑜎", "𑜏", "𝐰", "𝑤", "𝒘", "𝓌", "𝔀", "𝔴", "𝕨", "𝖜", "𝗐", "𝘄", "𝘸", "𝙬", "𝚠", "\/\/"],
                x: ["x", "×", "х", "ᕁ", "ᕽ", "᙮", "ⅹ", "⤫", "⤬", "⨯", "𝐱", "𝑥", "𝒙", "𝓍", "𝔁", "𝔵", "𝕩", "𝖝", "𝗑", "𝘅", "𝘹", "𝙭", "𝚡", "ｘ"],
                y: ["y", "ɣ", "ʏ", "γ", "у", "ү", "ყ", "ᶌ", "ỿ", "𑣜", "𝐲", "𝑦", "𝒚", "𝓎", "𝔂", "𝔶", "𝕪", "𝖞", "𝗒", "𝘆", "𝘺", "𝙮", "𝚢", "𝛄", "𝛾", "𝜸", "𝝲", "𝞬", "ｙ"],
                z: ["Z", "z", "z", "ᴢ", "ꮓ", "𑣄", "𝐳", "𝑧", "𝒛", "𝓏", "𝔃", "𝕫", "𝗓", "𝘇", "𝘻", "𝙯", "𝚣"],
                "1": ["𝟭", "𝟷", "𝟏", "𝟙", "𝟣", "1"],
                "2": ["2", "ᒿ", "Ꙅ", "ꛯ", "𝟐", "𝟚", "𝟤", "𝟮", "𝟸"],
                "3": ["3", "Ʒ", "Ȝ", "З", "Ӡ", "Ⳍ", "Ꝫ" , "𑣊", "𖼻"],
                "4": ["4", "Ꮞ", "𑢯", "𝟒", "𝟜", "𝟦", "𝟰", "𝟺"],
                "5": ["5", "Ƽ", "𑢻", "𝟓", "𝟝", "𝟧", "𝟱", "𝟻"],
                "6": ["6", "б", "Ꮾ", "Ⳓ", "𑣕", "𝟔", "𝟞", "𝟨", "𝟲", "𝟼"],
                "7": ["7", "𐓒", "𑣆" ],
                "8": ["8", "Ȣ", "ȣ", "৪", "੪ଃ", "𐌚", "𝟖", "𝟠", "𝟪", "𝟴", "𝟾", "𞣋"],
                "9": ["9", "৭", "੧", "୨", "൭", "Ⳋ", "Ꝯ", "𑢬", "𑣌", "𑣖", "𝟗", "𝟡", "𝟫", "𝟵", "𝟿"],
                "0": ["0", "O", "Ο", "О", "Օ", "߀", "০", "ଠ", "୦", "ዐ", "Ⲟ", "ⵔ", "〇", "ꓳ", "𐊒", "𐊫", "𐐄", "𐓂", "𐔖", "𑓐", "𑢵", "𑣠", "𝐎", "𝑂", "𝑶", "𝒪", "𝓞", "𝔒", "𝕆", "𝕺", "𝖮", "𝗢", "𝘖", "𝙊", "𝙾", "𝚶", "𝛰", "𝜪", "𝝤", "𝞞", "𝟎", "𝟘", "𝟢", "𝟬", "𝟶"],
            } as { [key: string]: string[] }

            let res = ""
            arr.forEach(s => {
                const characterList = list[s]
                if (!characterList) {
                    return res += s
                } 
                const index = Math.floor(Math.random() * characterList.length)
                return res += characterList[index]
            })
            return res
        }
    }
})

</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
.page-404 {
    display: flex;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    flex-flow: row wrap;
    gap: 40px;
    justify-content: center;
    align-items: center;
    font-size: 2vw;
}
.page-404-title {
    position: absolute;
    top: 50%;
    left: 50%;
    display: inline-block;
    width: 50vw;
    z-index: 2024;
    translate: -50% -50%;
    font-size: 8vw;
    margin: 0;
    padding: 0;
    text-shadow: 0 0 8px rgba(255,255,255.8);
}

.layer2 {
    position: absolute;
    overflow: hidden;
    display: flex;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    font-size: 2em;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
}
</style>