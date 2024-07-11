<template>
  <v-card style="max-height: 85vh; height: 85vh">
    <v-card-title>
      {{ __("Coupons") }}
    </v-card-title>
    <section class="p-2">
      <v-text-field
        variant="outlined"
        density="compact"
        color="primary"
        :label="__('Coupon')"
        v-model="new_coupon"
      >
        <template v-slot:append>
          <v-btn color="success" @click="add_coupon(new_coupon)">
            {{ __("add") }}
          </v-btn>
        </template>
      </v-text-field>
    </section>
    <div class="overflow-y-auto">
      <v-data-table
        :headers="items_headers"
        :items="posa_coupons"
        :single-expand="singleExpand"
        item-key="coupon"
        :items-per-page="itemsPerPage"
        hide-default-footer
        @mouseover="style = 'cursor: pointer'"
      >
        <template v-slot:item.applied="{ item }">
          <v-checkbox v-model="item.applied" disabled></v-checkbox>
        </template>
      </v-data-table>
    </div>
  </v-card>

  <v-btn
    elevation="0"
    block
    class="mt-2"
    variant="flat"
    color="warning"
    @click="back_to_invoice"
    >{{ __("Back") }}</v-btn
  >
</template>

<script>
import { eventBus } from "../../bus";
export default {
  data: () => ({
    loading: false,
    pos_profile: "",
    customer: "",
    posa_coupons: [],
    new_coupon: null,
    itemsPerPage: 1000,
    singleExpand: true,
    items_headers: [
      { title: __("Coupon"), key: "coupon_code", align: "start" },
      { title: __("Type"), key: "type", align: "start" },
      { title: __("Offer"), key: "pos_offer", align: "start" },
      { title: __("Applied"), key: "applied", align: "start" },
    ],
  }),

  computed: {
    couponsCount() {
      return this.posa_coupons.length;
    },
    appliedCouponsCount() {
      return this.posa_coupons.filter((el) => !!el.applied).length;
    },
  },

  methods: {
    back_to_invoice() {
      eventBus.emit("show_coupons", "false");
    },
    add_coupon(new_coupon) {
      if (!this.customer || !new_coupon) return;
      const exist = this.posa_coupons.find(
        (el) => el.coupon_code == new_coupon
      );
      if (exist) {
        eventBus.emit("show_mesage", {
          text: __("This coupon already used !"),
          color: "error",
        });
        return;
      }
      const vm = this;
      frappe.call({
        method: "posawesome.posawesome.api.posapp.get_pos_coupon",
        args: {
          coupon: new_coupon,
          customer: vm.customer,
          company: vm.pos_profile.company,
        },
        callback: function (r) {
          if (r.message) {
            const res = r.message;
            if (res.msg != "Apply" || !res.coupon) {
              eventBus.emit("show_mesage", {
                text: res.msg,
                color: "error",
              });
            } else {
              vm.new_coupon = null;
              const coupon = res.coupon;
              vm.posa_coupons.push({
                coupon: coupon.name,
                coupon_code: coupon.coupon_code,
                type: coupon.coupon_type,
                applied: 0,
                pos_offer: coupon.pos_offer,
                customer: coupon.customer || vm.customer,
              });
            }
          }
        },
      });
    },
    setActiveGiftCoupons() {
      if (!this.customer) return;
      const vm = this;
      frappe.call({
        method: "posawesome.posawesome.api.posapp.get_active_gift_coupons",
        args: {
          customer: vm.customer,
          company: vm.pos_profile.company,
        },
        callback: function (r) {
          if (r.message) {
            const coupons = r.message;
            coupons.forEach((coupon_code) => {
              vm.add_coupon(coupon_code);
            });
          }
        },
      });
    },

    updatePosCoupons(offers) {
      this.posa_coupons.forEach((coupon) => {
        const offer = offers.find(
          (el) => el.offer_applied && el.coupon == coupon.coupon
        );
        if (offer) {
          coupon.applied = 1;
        } else {
          coupon.applied = 0;
        }
      });
    },

    removeCoupon(reomove_list) {
      this.posa_coupons = this.posa_coupons.filter(
        (coupon) => !reomove_list.includes(coupon.coupon)
      );
    },
    updateInvoice() {
      eventBus.emit("update_invoice_coupons", this.posa_coupons);
    },
    updateCounters() {
      eventBus.emit("update_coupons_counters", {
        couponsCount: this.couponsCount,
        appliedCouponsCount: this.appliedCouponsCount,
      });
    },
  },

  watch: {
    posa_coupons: {
      deep: true,
      handler() {
        this.updateInvoice();
        this.updateCounters();
      },
    },
  },

  created: function () {
    this.$nextTick(function () {
      eventBus.on("register_pos_profile", (data) => {
        this.pos_profile = data.pos_profile;
      });
    });
    eventBus.on("update_customer", (customer) => {
      if (this.customer != customer) {
        const to_remove = [];
        this.posa_coupons.forEach((el) => {
          if (el.type == "Promotional") {
            el.customer = customer;
          } else {
            to_remove.push(el.coupon);
          }
        });
        this.customer = customer;
        if (to_remove.length) {
          this.removeCoupon(to_remove);
        }
      }
      this.setActiveGiftCoupons();
    });
    eventBus.on("update_pos_coupons", (data) => {
      this.updatePosCoupons(data);
    });
    eventBus.on("set_pos_coupons", (data) => {
      this.posa_coupons = data;
    });
  },
};
</script>
