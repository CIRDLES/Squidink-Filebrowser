<template>
    <div
            class="context-menu"
            ref="popper"
            v-show="isVisible"
            tabindex="-1"
            v-click-outside="close"
            @contextmenu.capture.prevent>
        <ul>
            <slot :contextData="contextData" />
        </ul>
    </div>
</template>
<script>
    import Popper from 'popper.js';
    import ClickOutside from 'vue-click-outside'
    // @vue/component
    export default {
        props: {
            boundariesElement: {
                type: String,
                default: 'body',
            },
        },
        components: {
            // eslint-disable-next-line vue/no-unused-components
            Popper,
        },
        data() {
            return {
                opened: false,
                contextData: {},
            };
        },
        directives:{
            ClickOutside,
        },
        computed: {
            isVisible() {
                return this.opened;
            },
        },
        methods: {
            open(evt, contextData) {
                this.opened = true;
                this.contextData = contextData;
                function generateGetBoundingClientRect(x = 0, y = 0) {
                    return () => ({
                        width: 0,
                        height: 0,
                        top: y,
                        right: x,
                        bottom: y,
                        left: x,
                    });
                }
                const virtualElement = {
                    getBoundingClientRect: generateGetBoundingClientRect(),
                };

                if (this.popper) {
                    this.popper.destroy();
                }

                this.popper = new Popper(virtualElement, this.$refs.popper, {
                    placement: 'right-start',
                    modifiers: {
                        preventOverflow: {
                            boundariesElement: document.querySelector(this.boundariesElement),
                        },
                    },
                });
                document.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
                    virtualElement.getBoundingClientRect = generateGetBoundingClientRect(x, y);
                });

                // Recalculate position
                this.$nextTick(() => {
                    this.popper.scheduleUpdate();
                });

            },
            close() {
                this.opened = false;
                this.contextData = null;
            },
            referenceObject(evt) {
                const left = evt.clientX;
                const top = evt.clientY;
                const right = left + 1;
                const bottom = top + 1;
                const clientWidth = 1;
                const clientHeight = 1;

                function getBoundingClientRect() {
                    return {
                        left,
                        top,
                        right,
                        bottom,
                    };
                }

                const obj = {
                    getBoundingClientRect,
                    clientWidth,
                    clientHeight,
                };
                return obj;
            },
        },
        beforeDestroy() {
            if (this.popper !== undefined) {
                this.popper.destroy();
            }
        },
    };

</script>

<style lang="scss" scoped>

    .context-menu {
        position: fixed;
        z-index: 999;
        width: auto;
        overflow: visible;
        width: auto !important;
        background: #FFF;
        border-radius: 4px;
        box-shadow: 0 1px 4px 0 #eee;

        &:focus {
            outline: none;
        }

        ul {
            padding:0px;
            margin:0px;
        }
    }


</style>
