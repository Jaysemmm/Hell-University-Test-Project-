import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApollo(() => {
      return {
        link: new UploadHttpLink({ uri: environment.graphqlUrl }) as unknown as ApolloLink,
        cache: new InMemoryCache(),
      };
    }),
  ]
};