import { createApp, h } from 'vue';
import { createVuetify } from 'vuetify';
import Home from './Home.vue';

frappe.provide('frappe.PosApp');

const translationPlugin = {
    install(app) {
      app.config.globalProperties.__ = window.__;
    }
  };

frappe.PosApp.posapp = class {
    constructor({ parent }) {
        this.$parent = $(document);
        this.page = parent.page;
        this.make_body();

    }

    make_body () {
        const vuetify = createVuetify({
            rtl: frappe.utils.is_rtl(),
            theme: {
                themes: {
                    light: {
                        background: '#FFFFFF',
                        primary: '#0097A7',
                        secondary: '#00BCD4',
                        accent: '#9575CD',
                        success: '#66BB6A',
                        info: '#2196F3',
                        warning: '#FF9800',
                        error: '#E86674',
                        orange: '#E65100',
                        golden: '#A68C59',
                        badge: '#F5528C',
                        customPrimary: '#085294',
                    },
                },
            },
        });

        const app = createApp({
            render: () => h(Home),
        });

        app.use(vuetify);
        app.use(translationPlugin);

        // Ensure that the main-section exists before mounting
        const mainSection = this.$parent.find('.main-section')[0];
        if (mainSection) {
            app.mount(mainSection);
        } else {
            console.error('main-section not found');
        }
    }

    setup_header () {
        
    }
};