    function htmlCodepoints(arr) {
        return arr.map((codepoint) => String.fromCodePoint(codepoint)).join("");
    }



    const emoji = {
        template: `<span v-html="emoji" @click="emojiClick"></span>`,
        data() {
            return {
                emoji: ""
            };
        },
        props: {
            amount: {
                type: String,
                required: false
            },
            group: {
                type: String,
                required: true
            },
            Bind: {
                type: String,
                required: true
            }
        },

        created() {
            let g = this.group;
            let to = this.addBtn;

            axios
                .get(
                    "https://raw.githubusercontent.com/googlefonts/emoji-metadata/main/emoji_14_0_ordering.json"
                )
                .then((response) => {
                    this.emoji = response["data"]
                        .filter((x) => x.group == this.group)[0]
                        .emoji.map((x) => {
                            return {
                                symble: `<button bind="${this.Bind}" > ${htmlCodepoints(
                                    x.base
                                )} </button>`,
                                button: true
                            };
                        })
                        .map((x) => x.symble)
                        .join("");

                    if (this.amount == "all") {
                    } else {
                        this.emoji.length = Number(this.amount) || this.emoji.length;
                    }
                });
        },

        methods: {
            emojiClick(e) {
                let b = document.querySelector(e.target.getAttribute("bind"));

                console.log( b )
                b.value += e.target.innerText;
            }
        }
    };

    new Vue({
        el: "#app",
        components: {
            emoji: emoji
        }
    });
