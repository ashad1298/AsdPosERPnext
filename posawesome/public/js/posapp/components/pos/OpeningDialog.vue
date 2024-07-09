<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" persistent max-width="600px">
      <!-- <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark v-bind="attrs" v-on="on">Open Dialog</v-btn>
      </template>-->
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{ __('Create POS Opening Shift') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  :items="companies"
                  :label="__('Company')"
                  v-model="company"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  :items="pos_profiles"
                  :label="__('POS Profile')"
                  v-model="pos_profile"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-data-table
                  :headers="payments_methods_headers"
                  :items="payments_methods"
                  item-key="mode_of_payment"
                  class="elevation-1"
                  :items-per-page="itemsPerPage"
                  hide-default-footer
                > 
                  
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" dark @click="go_desk">Cancel</v-btn>
          <v-btn
            color="success"
            :disabled="is_loading"
            dark
            @click="submit_dialog"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { ref, onMounted } from 'vue';
import { eventBus } from '../../bus';
import format from '../../format';

export default {
  mixins: [format],
  props: ['dialog'],
  setup(props) {
    const isOpen = ref(props.dialog ?? false);
    const companies = ref([]);
    const  is_loading = ref(false);
    const company = ref('');
    const pos_profiles = ref([]);
    const pos_profile = ref('');
    const payments_methods = ref([]);
    const payments_methods_headers = ref([
      {
        title: __('Mode of Payment'),
        align: 'start',
        sortable: true,
        key: 'mode_of_payment',
      },
      {
        title: __('Opening Amount'),
        key: 'amount',
        align: 'center',
        sortable: false,
      },
    ]);
    const itemsPerPage = 100;

    const max25chars = (v) => v.length <= 12 || 'Input too long!';

    const close_opening_dialog = () => {
      eventBus.emit('close_opening_dialog');
    };

    const get_opening_dialog_data = () => {
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_opening_dialog_data',
        args: {},
        callback: (r) => {
          if (r.message) {
            companies.value = r.message.companies.map((element) => element.name);
            company.value = companies.value[0];
            pos_profiles.value = r.message.pos_profiles_data.map((element) => element.name);
            payments_methods.value = r.message.payments_method.map((element) => ({
              mode_of_payment: element.mode_of_payment,
              amount: 0,
              currency: element.currency,
            }));
          }
        },
      });
    };

    const submit_dialog = () => {
      if (!payments_methods.value.length || !company.value || !pos_profile.value) {
        return;
      }
      is_loading.value = true;
      frappe
        .call('posawesome.posawesome.api.posapp.create_opening_voucher', {
          pos_profile: pos_profile.value,
          company: company.value,
          balance_details: payments_methods.value,
        })
        .then((r) => {
          if (r.message) {
            eventBus.emit('register_pos_data', r.message);
            eventBus.emit('set_company', r.message.company);
            close_opening_dialog();
            is_loading.value = false;
          }
        });
    };

    const go_desk = () => {
      frappe.set_route('/');
      location.reload();
    };

    onMounted(() => {
      get_opening_dialog_data();
    });

    return {
      isOpen,
      companies,
      company,
      pos_profiles,
      pos_profile,
      payments_methods,
      payments_methods_headers,
      itemsPerPage,
      max25chars,
      is_loading,
      submit_dialog,
      go_desk,
    };
  },
};
</script>
