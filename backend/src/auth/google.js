import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { supabase } from "../supabase.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (!data) {
        const { data: user } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
        });

        await supabase.from("profiles").insert({
          id: user.user.id,
          name: profile.displayName,
        });

        return done(null, user.user);
      }

      done(null, data);
    }
  )
);
