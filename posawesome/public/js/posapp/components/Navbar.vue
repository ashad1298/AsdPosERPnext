<template>
  <nav>
    <v-app-bar app height="40" class="elevation-2">
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
        class="grey--text"
      ></v-app-bar-nav-icon>

      <v-img
        src="/assets/posawesome/js/posapp/components/pos/idara_restaurant.png"
        alt="Idara Restaurant"
        max-width="32"
        class="mr-2"
        color="primary"
      ></v-img>
      
      <v-toolbar-title
        @click="go_desk"
        style="cursor: pointer"
        class="text-uppercase primary--text"
      >
        <span class="font-weight-light" style="text-transform: none;">Idara</span>
        <span style="text-transform: capitalize;"><strong>Restaurant</strong></span>
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn color="primary" @click="show_tables" v-if="!is_table_view">{{ __("Tables") }}</v-btn>
      <v-btn color="primary" @click="show_tables" v-if="is_table_view">{{ __("Items") }}</v-btn>
      
      <v-spacer></v-spacer>
      <v-btn style="cursor: unset" text color="primary">
        <span right>{{ pos_profile.name }}</span>
      </v-btn>
      <div class="text-center">
        <v-menu>
        <template #activator="{ on, props }">
          <v-btn color="primary" dark text v-bind="props" v-on="on">Menu</v-btn>
        </template>
        <v-list elevation="1" dense>
          <v-list-item-group v-model="menu_item" color="primary">
            <v-list-item
              @click="close_shift_dialog"
              v-if="!pos_profile.posa_hide_closing_shift && item == 0"
            >
              <template v-slot:prepend>
                <v-icon>mdi-content-save-move-outline</v-icon>
              </template>
              <v-list-item-title>{{ __("Close Shift") }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="print_last_invoice"
              v-if="
                pos_profile.posa_allow_print_last_invoice && this.last_invoice
              "
            >
              <template v-slot:prepend>
                <v-icon>mdi-printer</v-icon>
              </template>
              <v-list-item-title>
                {{ __("Print Last Invoice") }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="logOut">
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>{{ __("Logout") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="go_about">
              <template v-slot:prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              <v-list-item-title>{{ __("About") }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
      </div>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      app
      class="primary margen-top"
      width="170"
    >
      <v-list dark>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img :src="company_img"></v-img>
          </v-list-item-avatar>

          <v-list-item-title>{{ company }}</v-list-item-title>

          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <!-- <MyPopup/> -->
        <v-list-item-group v-model="item" color="white">
          <v-list-item
            v-for="item in items"
            :key="item.text"
            @click="changePage(item.text)"
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-snackbar v-model="snack" :timeout="5000" :color="snackColor" top right>
      {{ snackText }}
    </v-snackbar>
    <v-dialog v-model="freeze" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          {{ freezeTitle }}
        </v-card-title>
        <v-card-text>{{ freezeMsg }}</v-card-text>
      </v-card>
    </v-dialog>
  </nav>
</template>

<script>
import { eventBus } from '../bus';

export default {
  // components: {MyPopup},
  data() {
    return {
      is_table_view: true,
      drawer: false,
      mini: true,
      item: 0,
      items: [{ text: 'POS', icon: 'mdi-network-pos' }],
      page: '',
      fav: true,
      menu: false,
      message: false,
      hints: true,
      menu_item: 0,
      snack: false,
      snackColor: '',
      snackText: '',
      company: 'POS Awesome',
      company_img: '/assets/posawesome/js/posapp/components/pos/idara_restaurant-circle.png',
      pos_profile: '',
      freeze: false,
      freezeTitle: '',
      freezeMsg: '',
      last_invoice: '',
    };
  },
  methods: {
    show_tables() {
      eventBus.emit("set_is_table_view", !this.is_table_view);
    },

    changePage(key) {
      this.emit('changePage', key);
    },
    go_desk() {
      frappe.set_route('/');
      location.reload();
    },
    go_about() {
      const win = window.open(
        'https://github.com/yrestom/POS-Awesome',
        '_blank'
      );
      win.focus();
    },
    close_shift_dialog() {
      eventBus.emit('open_closing_dialog');
    },
    show_mesage(data) {
      this.snack = true;
      this.snackColor = data.color;
      this.snackText = data.text;
    },
    logOut() {
      var me = this;
      me.logged_out = true;
      return frappe.call({
        method: 'logout',
        callback: function (r) {
          if (r.exc) {
            return;
          }
          frappe.set_route('/login');
          location.reload();
        },
      });
    },
    print_last_invoice() {
      if (!this.last_invoice) return;
      const print_format =
        this.pos_profile.print_format_for_online ||
        this.pos_profile.print_format;
      const letter_head = this.pos_profile.letter_head || 0;
      const url =
        frappe.urllib.get_base_url() +
        '/printview?doctype=Sales%20Invoice&name=' +
        this.last_invoice +
        '&trigger_print=1' +
        '&format=' +
        print_format +
        '&no_letterhead=' +
        letter_head;
      const printWindow = window.open(url, 'Print');
      printWindow.addEventListener(
        'load',
        function () {
          printWindow.print();
        },
        true
      );
    },
  },
  created: function () {
    this.$nextTick(function () {
      eventBus.on('show_mesage', (data) => {
        this.show_mesage(data);
      });
      eventBus.on('set_company', (data) => {
        this.company = data.name;
        this.company_img = data.company_logo
          ? data.company_logo
          : this.company_img;
      });
      eventBus.on('register_pos_profile', (data) => {
        this.pos_profile = data.pos_profile;
        const payments = { text: 'Payments', icon: 'mdi-cash-register' };
        if (
          this.pos_profile.posa_use_pos_awesome_payments &&
          this.items.length !== 2
        ) {
          this.items.push(payments);
        }
      });
      eventBus.on('set_last_invoice', (data) => {
        this.last_invoice = data;
      });
      eventBus.on('freeze', (data) => {
        this.freeze = true;
        this.freezeTitle = data.title;
        this.freezeMsg = data.msg;
      });
      eventBus.on('unfreeze', () => {
        this.freeze = false;
        this.freezTitle = '';
        this.freezeMsg = '';
      });

      eventBus.on('set_is_table_view', (value) => {
        this.is_table_view = value;
      });
    });
  },
};
</script>

<style scoped>
.margen-top {
  margin-top: 0px;
}
</style>
