<template>
  <v-row>
    <v-dialog
      v-model="customerDialog"
      max-width="600"
      @click:outside="clear_customer"
    >
      <v-card class="px-8">
        <v-card-title class="py-4 p-0">
          <template v-if="customer_id">{{ __("Update Customer") }}</template>
          <template v-else>{{ __("Create Customer") }}</template>
        </v-card-title>
        <v-row>
          <v-col cols="12" class="p-2">
            <v-text-field
              dense
              variant="outlined"
              color="primary"
              :label="__('Customer Name') + ' *'"
              background-color="white"
              hide-details
              v-model="customer_name"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-text-field
              dense
              variant="outlined"
              color="primary"
              :label="__('Tax ID')"
              background-color="white"
              hide-details
              v-model="tax_id"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-text-field
              dense
              variant="outlined"
              color="primary"
              :label="__('Mobile No')"
              background-color="white"
              hide-details
              v-model="mobile_no"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-text-field
              dense
              variant="outlined"
              color="primary"
              :label="__('Email Id')"
              background-color="white"
              hide-details
              v-model="email_id"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-select
              dense
              variant="outlined"
              label="Gender"
              :items="genders"
              v-model="gender"
            ></v-select>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-text-field
              dense
              variant="outlined"
              color="primary"
              :label="__('Referral Code')"
              background-color="white"
              hide-details
              v-model="referral_code"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-menu
              ref="birthday_menu"
              v-model="birthday_menu"
              :close-on-content-click="false"
              transition="scale-transition"
              dense
              variant="outlined"
            >
              <template v-slot:activator="{ on, props }">
                <v-text-field
                  v-model="birthday"
                  :label="__('Birthday')"
                  readonly
                  dense
                  variant="outlined"
                  clearable
                  hide-details
                  v-bind="props"
                  v-on="on"
                  color="primary"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="birthday"
                color="primary"
                no-title
                scrollable
                :max="frappe.datetime.now_date()"
                @input="birthday_menu = false"
              >
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-autocomplete
              clearable
              dense
              variant="outlined"
              auto-select-first
              color="primary"
              :label="__('Customer Group') + ' *'"
              v-model="group"
              :items="groups"
              background-color="white"
              :no-data-text="__('Group not found')"
              hide-details
              required
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="6" class="p-2">
            <v-autocomplete
              clearable
              dense
              variant="outlined"
              auto-select-first
              color="primary"
              :label="__('Territory') + ' *'"
              v-model="territory"
              :items="territorys"
              background-color="white"
              :no-data-text="__('Territory not found')"
              hide-details
              required
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="6" class="p-2" v-if="loyalty_program">
            <v-text-field
              v-model="loyalty_program"
              :label="__('Loyalty Program')"
              dense
              variant="outlined"
              readonly
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="p-2" v-if="loyalty_points">
            <v-text-field
              v-model="loyalty_points"
              :label="__('Loyalty Points')"
              dense
              variant="outlined"
              readonly
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
        <v-card-actions class="py-4 p-0">
          <v-btn color="error" dark @click="close_dialog">{{
            __("Close")
          }}</v-btn>
          <v-btn color="success" dark @click="submit_dialog">{{
            __("Submit")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { eventBus } from "../../bus";
export default {
  data: () => ({
    customerDialog: false,
    pos_profile: "",
    customer_id: "",
    customer_name: "",
    tax_id: "",
    mobile_no: "",
    email_id: "",
    referral_code: "",
    birthday: null,
    birthday_menu: false,
    group: "",
    groups: [],
    territory: "",
    territorys: [],
    genders: [],
    customer_type: "Individual",
    gender: "",
    loyalty_points: null,
    loyalty_program: null,
  }),
  watch: {},
  methods: {
    close_dialog() {
      this.customerDialog = false;
      this.clear_customer();
    },
    clear_customer() {
      this.customer_name = "";
      this.tax_id = "";
      this.mobile_no = "";
      this.email_id = "";
      this.referral_code = "";
      this.birthday = "";
      this.group = frappe.defaults.get_user_default("Customer Group");
      this.territory = frappe.defaults.get_user_default("Territory");
      this.customer_id = "";
      this.customer_type = "Individual";
      this.gender = "";
      this.loyalty_points = null;
      this.loyalty_program = null;
    },
    getCustomerGroups() {
      if (this.groups.length > 0) return;
      const vm = this;
      frappe.db
        .get_list("Customer Group", {
          fields: ["name"],
          filters: { is_group: 0 },
          limit: 1000,
          order_by: "name",
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.groups.push(el.name);
            });
          }
        });
    },
    getCustomerTerritorys() {
      if (this.territorys.length > 0) return;
      const vm = this;
      frappe.db
        .get_list("Territory", {
          fields: ["name"],
          filters: { is_group: 0 },
          limit: 5000,
          order_by: "name",
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.territorys.push(el.name);
            });
          }
        });
    },
    getGenders() {
      const vm = this;
      frappe.db
        .get_list("Gender", {
          fields: ["name"],
          page_length: 10,
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.genders.push(el.name);
            });
          }
        });
    },
    submit_dialog() {
      // validate if all required fields are filled
      if (!this.customer_name) {
        eventBus.emit("show_mesage", {
          text: __("Customer name is required."),
          color: "error",
        });
        return;
      }
      if (!this.group) {
        eventBus.emit("show_mesage", {
          text: __("Customer group is required."),
          color: "error",
        });
        return;
      }
      if (!this.territory) {
        eventBus.emit("show_mesage", {
          text: __("Customer territory is required."),
          color: "error",
        });
        return;
      }
      if (this.customer_name) {
        const vm = this;
        const args = {
          customer_id: this.customer_id,
          customer_name: this.customer_name,
          company: this.pos_profile.company,
          tax_id: this.tax_id,
          mobile_no: this.mobile_no,
          email_id: this.email_id,
          referral_code: this.referral_code,
          birthday: this.birthday,
          customer_group: this.group,
          territory: this.territory,
          customer_type: this.customer_type,
          gender: this.gender,
          method: this.customer_id ? "update" : "create",
          pos_profile_doc: this.pos_profile,
        };
        frappe.call({
          method: "posawesome.posawesome.api.posapp.create_customer",
          args: args,
          callback: (r) => {
            if (!r.exc && r.message.name) {
              let text = __("Customer created successfully.");
              if (vm.customer_id) {
                text = __("Customer updated successfully.");
              }
              eventBus.emit("show_mesage", {
                text: text,
                color: "success",
              });
              args.name = r.message.name;
              frappe.utils.play_sound("submit");
              eventBus.emit("add_customer_to_list", args);
              eventBus.emit("set_customer", r.message.name);
              eventBus.emit("fetch_customer_details");
              this.close_dialog();
            } else {
              frappe.utils.play_sound("error");
              eventBus.emit("show_mesage", {
                text: __("Customer creation failed."),
                color: "error",
              });
            }
          },
        });
        this.customerDialog = false;
      }
    },
  },
  created: function () {
    eventBus.on("open_update_customer", (data) => {
      this.customerDialog = true;
      if (data) {
        this.customer_name = data.customer_name;
        this.customer_id = data.name;
        this.tax_id = data.tax_id;
        this.mobile_no = data.mobile_no;
        this.email_id = data.email_id;
        this.referral_code = data.referral_code;
        this.birthday = data.birthday;
        this.group = data.customer_group;
        this.territory = data.territory;
        this.loyalty_points = data.loyalty_points;
        this.loyalty_program = data.loyalty_program;
        this.gender = data.gender;
      }
    });
    eventBus.on("register_pos_profile", (data) => {
      this.pos_profile = data.pos_profile;
    });
    eventBus.on("payments_register_pos_profile", (data) => {
      this.pos_profile = data.pos_profile;
    });
    this.getCustomerGroups();
    this.getCustomerTerritorys();
    this.getGenders();
    // set default values for customer group and territory from user defaults
    this.group = frappe.defaults.get_user_default("Customer Group");
    this.territory = frappe.defaults.get_user_default("Territory");
  },
};
</script>
