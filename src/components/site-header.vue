<template>
    <header class="site-header">
        <RouterLink to="/">
            <span class="site-header-logo" ref="logo"></span>
        </RouterLink>
        <nav class="site-header-navigation">
            <span class="site-header-navigation-item">
                <RouterLink to="/projects">
                    Projects
                </RouterLink>
            </span>
            <span class="site-header-navigation-item">
                <RouterLink to="/tools">
                    Thoughts
                </RouterLink>
            </span>
            <span class="site-header-navigation-item">
                <RouterLink to="/about/me">
                    About
                </RouterLink>
                <div class="site-header-navigation-dropdown __isHidden" id="dropdown-about">
                    <RouterLink class="site-header-navigation-dropdown-item" to="/about/me">Me</RouterLink>
                    <RouterLink class="site-header-navigation-dropdown-item" to="/about/others">Others</RouterLink>
                </div>
            </span>
        </nav>
    </header>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import { Icon } from "jao-icons"

export default defineComponent({
    name: "languageSelector",
    components: {
    },
    setup() {
    },
    data: () => {
        return {
            selection: "en",
            isOpen: false
        }
    },
    computed: {
    },
    mounted() {
        const logo = this.$refs["logo"] as HTMLElement
        const icon = Icon("medium/logo")
        if (logo && icon) {
            logo.appendChild(icon)
        }
    },
    methods: {
    }
})
</script>

<style lang="scss">
@import "./../assets/scss/variables.scss";
.site-header-logo {
    height: 36px;
    padding: 7px;
    display: block;
    svg {
        display: inline-block;
        height: 100%;
    }
}
.site-header {
    display: flex;
    width: 100vw;
    height: 36px;
}

.site-header-navigation {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 8px;
}

.site-header-navigation-item {
    font-family: $accentFont;
    position: relative;

    a {
        text-decoration: none;
        color: var(--contrast-color);
    }
}

.site-header-navigation-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    display: flex;
    flex-flow: column;
    width: 128px;
    gap: 8px;
}

.site-header-navigation-dropdown-item {
    display: inline-block;
}

@media all and (min-width: 640px) {
    .site-header-logo,
    .site-header {
        height: 56px;
    }

    .site-header-navigation {
        gap:16px;
    }

    .site-header-navigation-item {
        font-size: 24px;
        padding-left: 24px;
    }

    .site-header-navigation-dropdown-item {
        font-size: .8em;
    }
}

@media all and (min-width: 800px) {
    .site-header-logo,
    .site-header {
        height: 72px;
    }

    
    .site-header-navigation {
        gap:32px;
    }

    .site-header-navigation-item {
        font-size: 32px;
        padding-left: 16px;
    }
}
</style>
