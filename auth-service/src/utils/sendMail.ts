import * as sgMail from "@sendgrid/mail";

const templates = {
  account_activation: "d-79b2ba75946a40669fecde955918fe59",
  forgot_password: "d-ea2e916da0cb4950a2f9734c68d86c8b",
  change_email: "d-e96ab1458c6e488ab8ed775b936e1ba3",
  successful_changed_email: "d-53da93e740fd4cd4939ac4887833a733",
};

export default function (
  to: string,
  template:
    | "account_activation"
    | "forgot_password"
    | "change_email"
    | "successful_changed_email",
  data: any
) {
  const msg = {
    to,
    from: "noreply@hexpalette.com",
    templateId: templates[template],
    dynamic_template_data: data,
  };

  sgMail.send(msg).then(
    () => {
      return;
    },
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
}
