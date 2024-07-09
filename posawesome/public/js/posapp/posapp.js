import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import Home from './Home.vue';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

frappe.provide('frappe.PosApp');

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
            components,
            directives
        });

        const app = createApp(Home);

        app.use(vuetify);
        app.use({
            install(app) {
              app.config.globalProperties.frappe = window.frappe;
              app.config.globalProperties.__ = window.__;
            }
          });

        // Ensure that the main-section exists before mounting
        const mainSection = this.$parent.find('.main-section')[0];
        if (mainSection) {
            app.mount(mainSection);
        } else {
            console.error('main-section not found');
        }
    }
    setup_header () {}
};