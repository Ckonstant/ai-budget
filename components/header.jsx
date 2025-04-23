import React from "react";
import { checkUser } from "@/lib/checkUser";
import { getUserAccounts } from "@/actions/dashboard";
import { HeaderClient } from "./header-client";

const Header = async () => {
  await checkUser();
  const accounts = await getUserAccounts();

  return <HeaderClient accounts={accounts} />;
};

export default Header;