<template>
  <div>
    <v-autocomplete
      dense
      clearable
      auto-select-first
      outlined
      color="primary"
      :label="__('Customer')"
      v-model="customer"
      :items="customers"
      item-title="customer_name"
      item-key="name"
      background-color="white"
      :no-data-text="__('Customer not found')"
      hide-details
      
      :disabled="readonly"
      append-icon="mdi-plus"
      @click:append="new_customer"
      prepend-inner-icon="mdi-account-edit"
      @click:prepend-inner="edit_customer"
    >
      <template v-slot:item="{props, item}">
          <v-list style="padding-left: 10px !important;">
            <v-list-item v-bind="props">
              <v-list-item-subtitle
                v-if="item.raw.customer_name != item.raw.name"
                v-text="`ID: ${item.raw.name}`"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="item.raw.tax_id"
                v-text="`TAX ID: ${item.raw.tax_id}`"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="item.raw.email_id"
                v-text="`Email: ${item.raw.email_id}`"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="item.raw.mobile_no"
                v-text="`Mobile No: ${item.raw.mobile_no}`"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="item.raw.primary_address"
                v-text="`Primary Address: ${item.raw.primary_address}`"
              ></v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </template>
    </v-autocomplete>
    <div class="mb-8">
      <UpdateCustomer></UpdateCustomer>
    </div>
  </div>
</template>

<script>
import { eventBus } from '../../bus';
import UpdateCustomer from './UpdateCustomer.vue';
export default {
  data: () => ({
    pos_profile: '',
    customers: [],
    customer: '',
    readonly: false,
    customer_info: {},
  }),

  components: {
    UpdateCustomer,
  },

  methods: {
    get_customer_names() {
      const vm = this;
      if (this.customers.length > 0) {
        return;
      }
      if (vm.pos_profile.posa_local_storage && localStorage.customer_storage) {
        vm.customers = JSON.parse(localStorage.getItem('customer_storage'));
      }
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_customer_names',
        args: {
          pos_profile: this.pos_profile.pos_profile,
        },
        callback: function (r) {
          if (r.message) {
            vm.customers = r.message;
            console.info('loadCustomers');
            if (vm.pos_profile.posa_local_storage) {
              localStorage.setItem('customer_storage', '');
              localStorage.setItem(
                'customer_storage',
                JSON.stringify(r.message)
              );
            }
          }
        },
      });
    },
    new_customer() {
      eventBus.emit('open_update_customer', null);
    },
    edit_customer() {
      eventBus.emit('open_update_customer', this.customer_info);
    },
    customFilter(item, queryText, itemText) {
      console.log(item, queryText);

      const textOne = item.customer_name
        ? item.customer_name.toLowerCase()
        : '';
      const textTwo = item.tax_id ? item.tax_id.toLowerCase() : '';
      const textThree = item.email_id ? item.email_id.toLowerCase() : '';
      const textFour = item.mobile_no ? item.mobile_no.toLowerCase() : '';
      const textFifth = item.name.toLowerCase();
      const searchText = queryText.toLowerCase();

      return (
        textOne.indexOf(searchText) > -1 ||
        textTwo.indexOf(searchText) > -1 ||
        textThree.indexOf(searchText) > -1 ||
        textFour.indexOf(searchText) > -1 ||
        textFifth.indexOf(searchText) > -1
      );
    },
  },

  computed: {},

  created: function () {
    this.$nextTick(function () {
      eventBus.on('register_pos_profile', (pos_profile) => {
        this.pos_profile = pos_profile;
        this.get_customer_names();
      });
      eventBus.on('payments_register_pos_profile', (pos_profile) => {
        this.pos_profile = pos_profile;
        this.get_customer_names();
      });
      eventBus.on('set_customer', (customer) => {
        this.customer = customer;
      });
      eventBus.on('add_customer_to_list', (customer) => {
        this.customers.push(customer);
      });
      eventBus.on('set_customer_readonly', (value) => {
        this.readonly = value;
      });
      eventBus.on('set_customer_info_to_edit', (data) => {
        this.customer_info = data;
      });
      eventBus.on('fetch_customer_details', () => {
        this.get_customer_names();
      });
    });
  },

  watch: {
    customer() {
      eventBus.emit('update_customer', this.customer);
    },
  },
};
</script>
