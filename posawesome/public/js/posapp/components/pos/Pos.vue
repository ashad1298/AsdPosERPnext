<template>
  <div fluid class="mt-2">
    <TableUI v-if="!dialog && is_table_view"></TableUI>
    <ClosingDialog></ClosingDialog>
    <Drafts v-if="!is_table_view"></Drafts>
    <SalesOrders  v-if="!is_table_view"></SalesOrders>
    <Returns v-if="!is_table_view"></Returns>
    <NewAddress v-if="!is_table_view"></NewAddress>
    <MpesaPayments v-if="!is_table_view"></MpesaPayments>
    <Variants v-if="!is_table_view"></Variants>
    <OpeningDialog v-if="dialog" :dialog="dialog"></OpeningDialog>
    <v-row v-show="!dialog && !is_table_view">
      <v-col
        v-show="!payment && !offers && !coupons"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <ItemsSelector></ItemsSelector>
      </v-col>
      <v-col
        v-show="offers"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <PosOffers></PosOffers>
      </v-col>
      <v-col
        v-show="coupons"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <PosCoupons></PosCoupons>
      </v-col>
      <v-col
        v-show="payment"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <Payments></Payments>
      </v-col>

      <v-col xl="7" lg="7" md="7" sm="7" cols="12" class="pos">
        <Invoice></Invoice>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { eventBus } from '../../bus';
import ItemsSelector from './ItemsSelector.vue';
import Invoice from './Invoice.vue';
import OpeningDialog from './OpeningDialog.vue';
import Payments from './Payments.vue';
import PosOffers from './PosOffers.vue';
import PosCoupons from './PosCoupons.vue';
import Drafts from './Drafts.vue';
import SalesOrders from "./SalesOrders.vue";
import ClosingDialog from './ClosingDialog.vue';
import NewAddress from './NewAddress.vue';
import Variants from './Variants.vue';
import Returns from './Returns.vue';
import MpesaPayments from './Mpesa-Payments.vue';
import TableUI from '../Table/TableUI.vue';

export default {
  data: function () {
    return {
      is_table_view: true,
      dialog: false,
      pos_profile: '',
      pos_opening_shift: '',
      payment: false,
      offers: false,
      coupons: false,
    };
  },

  components: {
    ItemsSelector,
    Invoice,
    OpeningDialog,
    Payments,
    Drafts,
    ClosingDialog,

    TableUI,
    Returns,
    PosOffers,
    PosCoupons,
    NewAddress,
    Variants,
    MpesaPayments,
    SalesOrders,
  },

  methods: {
    check_opening_entry() {
      return frappe
        .call('posawesome.posawesome.api.posapp.check_opening_shift', {
          user: frappe.session.user,
        })
        .then((r) => {
          if (r.message) {
            this.pos_profile = r.message.pos_profile;
            this.pos_opening_shift = r.message.pos_opening_shift;
            this.get_offers(this.pos_profile.name);
            eventBus.emit('register_pos_profile', r.message);
            eventBus.emit('set_company', r.message.company);
            console.info('LoadPosProfile');
          } else {
            this.create_opening_voucher();
          }
        });
    },
    create_opening_voucher() {
      this.dialog = true;
    },
    get_closing_data() {
      return frappe
        .call(
          'posawesome.posawesome.doctype.pos_closing_shift.pos_closing_shift.make_closing_shift_from_opening',
          {
            opening_shift: this.pos_opening_shift,
          }
        )
        .then((r) => {
          if (r.message) {
            eventBus.emit('open_ClosingDialog', r.message);
          } else {
            // console.log(r);
          }
        });
    },
    submit_closing_pos(data) {
      frappe
        .call(
          'posawesome.posawesome.doctype.pos_closing_shift.pos_closing_shift.submit_closing_shift',
          {
            closing_shift: data,
          }
        )
        .then((r) => {
          if (r.message) {
            eventBus.emit('show_mesage', {
              text: `POS Shift Closed`,
              color: 'success',
            });
            this.check_opening_entry();
          } else {
            console.log(r);
          }
        });
    },
    get_offers(pos_profile) {
      return frappe
        .call('posawesome.posawesome.api.posapp.get_offers', {
          profile: pos_profile,
        })
        .then((r) => {
          if (r.message) {
            console.info('LoadOffers');
            eventBus.emit('set_offers', r.message);
          }
        });
    },
    get_pos_setting() {
      frappe.db.get_doc('POS Settings', undefined).then((doc) => {
        eventBus.emit('set_pos_settings', doc);
      });
    },
  },

  mounted: function () {
    this.$nextTick(function () {
      this.check_opening_entry();
      this.get_pos_setting();
      eventBus.on('close_opening_dialog', () => {
        this.dialog = false;
      });
      eventBus.on('register_pos_data', (data) => {
        this.pos_profile = data.pos_profile;
        this.get_offers(this.pos_profile.name);
        this.pos_opening_shift = data.pos_opening_shift;
        eventBus.emit('register_pos_profile', data);
        console.info('LoadPosProfile');
      });
      eventBus.on('show_payment', (data) => {
        this.payment = true ? data === 'true' : false;
        this.offers = false ? data === 'true' : false;
        this.coupons = false ? data === 'true' : false;
      });
      eventBus.on('show_offers', (data) => {
        this.offers = true ? data === 'true' : false;
        this.payment = false ? data === 'true' : false;
        this.coupons = false ? data === 'true' : false;
      });
      eventBus.on('show_coupons', (data) => {
        this.coupons = true ? data === 'true' : false;
        this.offers = false ? data === 'true' : false;
        this.payment = false ? data === 'true' : false;
      });
      eventBus.on('open_closing_dialog', () => {
        this.get_closing_data();
      });
      eventBus.on('submit_closing_pos', (data) => {
        this.submit_closing_pos(data);
      });
      eventBus.on('set_is_table_view', (value) => {
        this.is_table_view = value;
      });
    });
  },
  beforeDestroy() {
    eventBus.off('close_opening_dialog');
    eventBus.off('register_pos_data');
    eventBus.off('LoadPosProfile');
    eventBus.off('show_offers');
    eventBus.off('show_coupons');
    eventBus.off('open_closing_dialog');
    eventBus.off('submit_closing_pos');
  },
};
</script>

<style scoped></style>
